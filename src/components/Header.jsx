import React from "react";
import { Sparkles, Zap, User, LogIn } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function Header({ activeTab, setActiveTab }) {
  const { currentUser, userProfile, signInWithGoogle } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-dark-border px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neon-pink to-neon-purple flex items-center justify-center shadow-neon-pink group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-pink-200 to-neon-pink bg-clip-text text-transparent leading-none">
              7TH GARDEN
            </h1>
            <p className="text-[9px] text-neon-cyan font-mono tracking-wider leading-tight">
              PLACE FOR ART AND MUSIC
            </p>
          </div>
        </div>

        {/* User Balance & Profile Badge */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={() => setActiveTab("mypage")}
              className="flex items-center gap-2 bg-dark-surface hover:bg-dark-card border border-neon-pink/40 px-3 py-1.5 rounded-full transition-all"
            >
              <div className="flex items-center gap-1 font-mono font-bold text-xs text-neon-yellow">
                <Sparkles className="w-3.5 h-3.5 fill-neon-yellow text-neon-yellow" />
                <span>{userProfile?.points ?? 0}</span>
                <span className="text-[10px] text-gray-400">PT</span>
              </div>
              <img
                src={userProfile?.photoURL || currentUser.photoURL}
                alt="Avatar"
                className="w-6 h-6 rounded-full border border-neon-purple object-cover"
              />
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-neon-pink transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ログイン</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
