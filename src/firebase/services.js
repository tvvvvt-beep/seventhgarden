import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db, isConfigured } from "./config";
import { INITIAL_ARTISTS, INITIAL_TIPS } from "./mockData";

const DEFAULT_INITIAL_POINTS = 500;

/**
 * ユーザー情報の取得・作成 (初回登録時に初期ポイント500ptを保持)
 */
export async function getOrCreateUserProfile(user) {
  if (!user) return null;

  const defaultProfile = {
    uid: user.uid,
    displayName: user.displayName || "GUEST PARTY GOER",
    email: user.email || "",
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
    points: DEFAULT_INITIAL_POINTS,
    memberId: `7TH-${user.uid.slice(0, 6).toUpperCase()}`,
    createdAt: new Date().toISOString()
  };

  if (!isConfigured || !db) {
    const localUserJson = localStorage.getItem(`user_${user.uid}`);
    if (localUserJson) {
      return JSON.parse(localUserJson);
    }
    localStorage.setItem(`user_${user.uid}`, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      await setDoc(userRef, {
        ...defaultProfile,
        createdAt: serverTimestamp()
      });
      return defaultProfile;
    }
  } catch (error) {
    console.error("Error in getOrCreateUserProfile:", error);
    return defaultProfile;
  }
}

/**
 * ポイント投げ銭処理 (Firestore Transaction または LocalStorage)
 */
export async function sendTipTransaction({ userId, userProfile, artistId, amount, message }) {
  if (!userId || !artistId || amount <= 0) {
    throw new Error("無効なリクエストパラメータです。");
  }

  if (!isConfigured || !db) {
    const currentPoints = userProfile.points || 0;
    if (currentPoints < amount) {
      throw new Error("ポイントが不足しています。保有ポイント: " + currentPoints + " pt");
    }

    const updatedUser = {
      ...userProfile,
      points: currentPoints - amount
    };
    localStorage.setItem(`user_${userId}`, JSON.stringify(updatedUser));

    const newTip = {
      id: `tip_${Date.now()}`,
      fromUserId: userId,
      fromUserName: userProfile.displayName,
      toArtistId: artistId,
      toArtistName: artistId,
      amount: Number(amount),
      message: message || "SUPPORT!",
      timestamp: new Date().toISOString()
    };

    const localTips = JSON.parse(localStorage.getItem("party_tips") || "[]");
    localStorage.setItem("party_tips", JSON.stringify([newTip, ...localTips]));

    return { success: true, updatedUser, newTip };
  }

  try {
    const userRef = doc(db, "users", userId);
    const artistRef = doc(db, "artists", artistId);
    const tipRef = doc(collection(db, "tips"));

    let updatedPoints = 0;
    let tipRecord = null;

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("ユーザーアカウントが見つかりません。");
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      if (currentPoints < amount) {
        throw new Error(`ポイントが不足しています。必要: ${amount}pt / 残高: ${currentPoints}pt`);
      }

      const artistDoc = await transaction.get(artistRef);
      let artistName = "ARTIST";
      let currentArtistPoints = 0;

      if (artistDoc.exists()) {
        const artistData = artistDoc.data();
        artistName = artistData.name || "ARTIST";
        currentArtistPoints = artistData.totalPoints || 0;
      }

      updatedPoints = currentPoints - amount;
      transaction.update(userRef, { points: updatedPoints });

      if (artistDoc.exists()) {
        transaction.update(artistRef, { totalPoints: currentArtistPoints + amount });
      } else {
        transaction.set(artistRef, { totalPoints: amount, id: artistId });
      }

      tipRecord = {
        fromUserId: userId,
        fromUserName: userData.displayName || "PARTY GOER",
        toArtistId: artistId,
        toArtistName: artistName,
        amount: Number(amount),
        message: message || "BIG RESPECT!",
        timestamp: serverTimestamp()
      };
      transaction.set(tipRef, tipRecord);
    });

    return {
      success: true,
      newPoints: updatedPoints,
      tipRecord
    };

  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}

/**
 * アーティスト一覧の取得（常に最新の `INITIAL_ARTISTS` を優先）
 */
export async function fetchArtistsList() {
  // 古いキャッシュをリセット
  localStorage.setItem("party_artists", JSON.stringify(INITIAL_ARTISTS));

  if (!isConfigured || !db) {
    return INITIAL_ARTISTS;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "artists"));
    if (querySnapshot.empty) {
      for (const artist of INITIAL_ARTISTS) {
        await setDoc(doc(db, "artists", artist.id), artist);
      }
      return INITIAL_ARTISTS;
    }

    const artists = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // 時間が古い場合のフォールバック（最新の INITIAL_ARTISTS の time を適用）
      const matchingInitial = INITIAL_ARTISTS.find(a => a.id === docSnap.id);
      artists.push({
        id: docSnap.id,
        ...data,
        time: matchingInitial ? matchingInitial.time : (data.time || "時間未定")
      });
    });
    return artists.length > 0 ? artists : INITIAL_ARTISTS;
  } catch (error) {
    console.error("Error fetching artists from Firestore:", error);
    return INITIAL_ARTISTS;
  }
}

/**
 * 最新のTipフィード取得
 */
export async function fetchRecentTips() {
  if (!isConfigured || !db) {
    const localTips = JSON.parse(localStorage.getItem("party_tips") || "[]");
    return [...localTips, ...INITIAL_TIPS];
  }

  try {
    const q = query(collection(db, "tips"), orderBy("timestamp", "desc"), limit(20));
    const snapshot = await getDocs(q);
    const tips = [];
    snapshot.forEach(docSnap => {
      tips.push({ id: docSnap.id, ...docSnap.data() });
    });
    return tips.length > 0 ? tips : INITIAL_TIPS;
  } catch (error) {
    console.error("Error fetching tips:", error);
    return INITIAL_TIPS;
  }
}
