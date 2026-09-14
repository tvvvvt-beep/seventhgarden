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

  const isGuest = user.uid.startsWith("guest_") || user.uid.startsWith("demo_user_");

  if (!isConfigured || !db || isGuest) {
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

  const isGuest = userId.startsWith("guest_") || userId.startsWith("demo_user_");

  if (!isConfigured || !db || isGuest) {
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

    // Firestoreが利用可能ならバックグラウンドでフィードに書き込み試行
    if (isConfigured && db) {
      try {
        const tipRef = doc(collection(db, "tips"));
        setDoc(tipRef, {
          ...newTip,
          timestamp: serverTimestamp()
        }).catch(() => {});
      } catch (e) {
        // ignore background push error
      }
    }

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
/**
 * アーティスト一覧の取得（保存されたカスタム一覧があればそれを優先、なければ INITIAL_ARTISTS）
 */
export async function fetchArtistsList() {
  const customArtistsRaw = localStorage.getItem("party_artists_custom");
  let baseArtists = INITIAL_ARTISTS;
  if (customArtistsRaw) {
    try {
      baseArtists = JSON.parse(customArtistsRaw);
    } catch (e) {
      baseArtists = INITIAL_ARTISTS;
    }
  }

  if (!isConfigured || !db) {
    return baseArtists;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "artists"));
    const pointsMap = {};
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      pointsMap[docSnap.id] = {
        totalPoints: data.totalPoints,
        likesCount: data.likesCount
      };
    });

    const mergedArtists = baseArtists.map(artist => {
      const liveData = pointsMap[artist.id];
      return {
        ...artist,
        totalPoints: liveData?.totalPoints ?? artist.totalPoints,
        likesCount: liveData?.likesCount ?? artist.likesCount
      };
    });

    return mergedArtists;
  } catch (error) {
    console.error("Error fetching artists from Firestore:", error);
    return baseArtists;
  }
}

/**
 * アーティスト一覧の保存（更新マネジメント用）
 */
export async function saveArtistsList(artists) {
  try {
    localStorage.setItem("party_artists_custom", JSON.stringify(artists));
    if (isConfigured && db) {
      for (const artist of artists) {
        const artistRef = doc(db, "artists", artist.id);
        await setDoc(artistRef, artist, { merge: true }).catch(() => {});
      }
    }
    return { success: true };
  } catch (e) {
    console.error("Error saving artists list:", e);
    return { success: false, error: e };
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

/**
 * 登録ユーザー一覧の取得（サポート・告知メール用）
 */
export async function fetchRegisteredUsers() {
  const usersMap = new Map();

  // 1. デモ／初期登録ユーザー
  const defaultSampleUsers = [
    {
      uid: "user_sample_kenji",
      displayName: "Kenji @ Techno Floor",
      email: "kenji.techno.osaka@gmail.com",
      points: 1200,
      memberId: "7TH-K3NJ10",
      createdAt: "2026-09-01T10:15:00Z",
      role: "VIP Member"
    },
    {
      uid: "user_sample_yuki",
      displayName: "Yuki Ambient",
      email: "yuki.ambient.sound@gmail.com",
      points: 800,
      memberId: "7TH-YUK188",
      createdAt: "2026-09-03T14:30:00Z",
      role: "Regular"
    },
    {
      uid: "user_sample_tatsu",
      displayName: "Tatsuya Beats",
      email: "tatsu.beatbox.jp@gmail.com",
      points: 1500,
      memberId: "7TH-TATSU9",
      createdAt: "2026-09-05T19:20:00Z",
      role: "VIP Member"
    },
    {
      uid: "user_sample_rina",
      displayName: "Rina SoundLover",
      email: "rina.sound.club@gmail.com",
      points: 500,
      memberId: "7TH-RINA01",
      createdAt: "2026-09-08T12:00:00Z",
      role: "Regular"
    }
  ];

  defaultSampleUsers.forEach(u => usersMap.set(u.uid, u));

  // 2. localStorage から登録ユーザーを収集
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("user_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const u = JSON.parse(raw);
          if (u && u.uid) {
            usersMap.set(u.uid, {
              ...u,
              displayName: u.displayName || "GUEST PARTY GOER",
              points: u.points ?? 500,
              memberId: u.memberId || `7TH-${u.uid.slice(0, 6).toUpperCase()}`,
              createdAt: u.createdAt || new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn("Error reading local user profiles:", e);
  }

  // 3. Firestore から登録ユーザーを取得 (オンライン時)
  if (isConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        usersMap.set(docSnap.id, {
          uid: docSnap.id,
          ...data,
          displayName: data.displayName || "PARTY GOER",
          points: data.points ?? 500,
          memberId: data.memberId || `7TH-${docSnap.id.slice(0, 6).toUpperCase()}`,
          createdAt: data.createdAt ? (typeof data.createdAt.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString()
        });
      });
    } catch (e) {
      console.warn("Firestore users read error or denied:", e);
    }
  }

  return Array.from(usersMap.values());
}

/**
 * ユーザーの保有ポイント更新（バックオフィスサポート用）
 */
export async function updateUserPoints(uid, newPoints) {
  const points = Math.max(0, Number(newPoints) || 0);

  // localStorage 更新
  try {
    const key = `user_${uid}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const u = JSON.parse(raw);
      u.points = points;
      localStorage.setItem(key, JSON.stringify(u));
    }
  } catch (e) {
    console.warn("Error updating local user points:", e);
  }

  // Firestore 更新
  if (isConfigured && db) {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { points }, { merge: true });
    } catch (e) {
      console.warn("Error updating Firestore user points:", e);
    }
  }

  return { success: true, points };
}

