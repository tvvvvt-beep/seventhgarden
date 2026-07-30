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
    // Demo mode: LocalStorage を使用して永続化
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
      // 初回登録: 500pt 付与
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
 * Firestore Transaction を使用したポイント投げ銭処理
 */
export async function sendTipTransaction({ userId, userProfile, artistId, amount, message }) {
  if (!userId || !artistId || amount <= 0) {
    throw new Error("無効なリクエストパラメータです。");
  }

  // --- DEMO FALLBACK MODE ---
  if (!isConfigured || !db) {
    const currentPoints = userProfile.points || 0;
    if (currentPoints < amount) {
      throw new Error("ポイントが不足しています。保有ポイント: " + currentPoints + " pt");
    }

    // 1. ローカルユーザーのポイント更新
    const updatedUser = {
      ...userProfile,
      points: currentPoints - amount
    };
    localStorage.setItem(`user_${userId}`, JSON.stringify(updatedUser));

    // 2. ローカルTip履歴の保存
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

    // 3. ローカルアーティストポイントの更新
    const localArtists = INITIAL_ARTISTS;
    const targetArtist = localArtists.find(a => a.id === artistId);
    if (targetArtist) {
      targetArtist.totalPoints = (targetArtist.totalPoints || 0) + Number(amount);
      newTip.toArtistName = targetArtist.name;
    }
    localStorage.setItem("party_artists", JSON.stringify(localArtists));

    return { success: true, updatedUser, newTip };
  }

  // --- FIRESTORE TRANSACTION MODE ---
  try {
    const userRef = doc(db, "users", userId);
    const artistRef = doc(db, "artists", artistId);
    const tipRef = doc(collection(db, "tips"));

    let updatedPoints = 0;
    let tipRecord = null;

    await runTransaction(db, async (transaction) => {
      // 1. ユーザーデータ参照＆ポイント確認
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("ユーザーアカウントが見つかりません。");
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      if (currentPoints < amount) {
        throw new Error(`ポイントが不足しています。必要: ${amount}pt / 残高: ${currentPoints}pt`);
      }

      // 2. アーティストデータ参照
      const artistDoc = await transaction.get(artistRef);
      let artistName = "ARTIST";
      let currentArtistPoints = 0;

      if (artistDoc.exists()) {
        const artistData = artistDoc.data();
        artistName = artistData.name || "ARTIST";
        currentArtistPoints = artistData.totalPoints || 0;
      }

      // 3. ユーザーポイントを減算
      updatedPoints = currentPoints - amount;
      transaction.update(userRef, { points: updatedPoints });

      // 4. アーティスト累計ポイントを加算
      if (artistDoc.exists()) {
        transaction.update(artistRef, { totalPoints: currentArtistPoints + amount });
      } else {
        transaction.set(artistRef, { totalPoints: amount, id: artistId });
      }

      // 5. Tip ログの生成
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
 * アーティスト一覧の取得
 */
export async function fetchArtistsList() {
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
    querySnapshot.forEach((doc) => {
      artists.push({ id: doc.id, ...doc.data() });
    });
    return artists;
  } catch (error) {
    console.error("Error fetching artists:", error);
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
    snapshot.forEach(doc => {
      tips.push({ id: doc.id, ...doc.data() });
    });
    return tips.length > 0 ? tips : INITIAL_TIPS;
  } catch (error) {
    console.error("Error fetching tips:", error);
    return INITIAL_TIPS;
  }
}
