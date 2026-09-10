import React, { createContext, useState, useEffect } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, isConfigured } from "../firebase/config";
import { getOrCreateUserProfile } from "../firebase/services";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // モバイル端末判定
  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");

  // Auth Listener & Redirect Result
  useEffect(() => {
    let isMounted = true;

    if (isConfigured && auth) {
      // 1. リダイレクト復帰時の処理を確実に捕捉 (iOS Safari等のsignInWithRedirect対策)
      getRedirectResult(auth)
        .then(async (result) => {
          if (!isMounted) return;
          if (result && result.user) {
            setCurrentUser(result.user);
            const profile = await getOrCreateUserProfile(result.user);
            if (isMounted) setUserProfile(profile);
          }
        })
        .catch((error) => {
          console.error("Firebase getRedirectResult error:", error);
          if (isMounted) {
            setAuthError("Googleログインの完了中にエラーが発生しました。もう一度お試しいただくか、ニックネームでご参加ください。");
          }
        });

      // 2. 認証状態の監視
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;
        setCurrentUser(user);
        if (user) {
          const profile = await getOrCreateUserProfile(user);
          if (isMounted) setUserProfile(profile);
        } else {
          // Firebase Auth ユーザーがいない場合、ゲストセッションを確認
          const guestSession = localStorage.getItem("guest_user_session") || localStorage.getItem("demo_user_session");
          if (guestSession) {
            try {
              const parsed = JSON.parse(guestSession);
              setCurrentUser(parsed);
              const profile = await getOrCreateUserProfile(parsed);
              if (isMounted) setUserProfile(profile);
            } catch (e) {
              console.warn("Error parsing guest session:", e);
              if (isMounted) setUserProfile(null);
            }
          } else {
            if (isMounted) setUserProfile(null);
          }
        }
        if (isMounted) setLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      // Demo / Local Mode: Check local storage for mock user session
      const mockSession = localStorage.getItem("guest_user_session") || localStorage.getItem("demo_user_session");
      if (mockSession) {
        try {
          const parsed = JSON.parse(mockSession);
          setCurrentUser(parsed);
          getOrCreateUserProfile(parsed).then((p) => {
            if (isMounted) setUserProfile(p);
          });
        } catch (e) {
          console.warn("Mock session parse error:", e);
        }
      }
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Google ログイン
  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!isConfigured || !auth || !googleProvider) {
      // Firebase未設定時はクイックゲストログイン
      return quickGuestLogin("GUEST PARTY VIP");
    }
    try {
      if (isMobile) {
        // リダイレクト方式: 戻り値なし。getRedirectResult & onAuthStateChanged が復帰時に呼ばれる
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await getOrCreateUserProfile(result.user);
      setUserProfile(profile);
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      // ポップアップがブロックされた場合のわかりやすいメッセージ
      if (error.code === "auth/popup-blocked") {
        setAuthError("ブラウザのポップアップがブロックされました。ポップアップを許可するか、ニックネームで今すぐご参加ください。");
      } else if (error.code === "auth/popup-closed-by-user") {
        setAuthError(null); // ユーザー自身が閉じた場合はエラー表示不要
      } else {
        setAuthError("Googleログインに失敗しました。外部ブラウザで開くか、ニックネームで即時参加をお試しください。");
      }
      throw error;
    } finally {
      if (isMobile) return; // redirect はページ遷移するため finally で reset しない
      setLoading(false);
    }
  };

  // 登録不要！ニックネームで即時参加ログイン (500pt付与)
  const quickGuestLogin = async (customName = "") => {
    setAuthError(null);
    const cleanName = (customName || "").trim() || `GUEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const guestUser = {
      uid: `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      displayName: cleanName,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") || "guest"}@party.7thgarden`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      isGuest: true
    };

    localStorage.setItem("guest_user_session", JSON.stringify(guestUser));
    setCurrentUser(guestUser);
    const profile = await getOrCreateUserProfile(guestUser);
    setUserProfile(profile);
    return guestUser;
  };

  // デモ用互換エイリアス
  const demoLogin = (name = "VIP GUEST") => quickGuestLogin(name);

  // ログアウト
  const logout = async () => {
    if (isConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
    localStorage.removeItem("guest_user_session");
    localStorage.removeItem("demo_user_session");
    setCurrentUser(null);
    setUserProfile(null);
    setAuthError(null);
  };

  // ユーザープロファイル最新化
  const refreshUserProfile = async () => {
    if (currentUser) {
      const updated = await getOrCreateUserProfile(currentUser);
      setUserProfile(updated);
    }
  };

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    loading,
    authError,
    setAuthError,
    isMobile,
    signInWithGoogle,
    quickGuestLogin,
    demoLogin,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
