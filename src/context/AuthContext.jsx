import React, { createContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, isConfigured } from "../firebase/config";
import { getOrCreateUserProfile } from "../firebase/services";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          const profile = await getOrCreateUserProfile(user);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo Mode: Check local storage for mock user session
      const mockSession = localStorage.getItem("demo_user_session");
      if (mockSession) {
        const parsed = JSON.parse(mockSession);
        setCurrentUser(parsed);
        getOrCreateUserProfile(parsed).then(setUserProfile);
      }
      setLoading(false);
    }
  }, []);

  // Google ログイン
  const signInWithGoogle = async () => {
    if (!isConfigured || !auth || !googleProvider) {
      // Demo Mode Fallback Login
      return demoLogin();
    }
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await getOrCreateUserProfile(result.user);
      setUserProfile(profile);
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // デモ用一発ログイン
  const demoLogin = async (customName = "VIP GUEST") => {
    const demoUser = {
      uid: "demo_user_" + Math.floor(Math.random() * 10000),
      displayName: customName,
      email: "guest@7thgarden-party.com",
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`
    };
    localStorage.setItem("demo_user_session", JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    const profile = await getOrCreateUserProfile(demoUser);
    setUserProfile(profile);
    return demoUser;
  };

  // ログアウト
  const logout = async () => {
    if (isConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem("demo_user_session");
    setCurrentUser(null);
    setUserProfile(null);
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
    signInWithGoogle,
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
