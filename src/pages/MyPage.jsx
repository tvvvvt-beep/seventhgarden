import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { LogIn, LogOut, Sparkles, User, ShieldCheck, Gift, History, AlertCircle, ArrowRight, Zap } from "lucide-react";

export default function MyPage({ userTips = [] }) {
  const { 
    currentUser, 
    userProfile, 
    signInWithGoogle, 
    quickGuestLogin, 
    logout, 
    setUserProfile,
    authError,
    setAuthError 
  } = useAuth();

  const [nicknameInput, setNicknameInput] = useState("");
  const [isSubmittingQuickJoin, setIsSubmittingQuickJoin] = useState(false);

  // ニックネームで即時参加
  const handleQuickJoin = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingQuickJoin(true);
      await quickGuestLogin(nicknameInput.trim());
    } finally {
      setIsSubmittingQuickJoin(false);
    }
  };

  // デモ用ポイント追加（動作テスト用）
  const handleAddBonusPoints = () => {
    if (userProfile) {
      const updated = { ...userProfile, points: (userProfile.points || 0) + 300 };
      setUserProfile(updated);
      localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-neon-pink" />
          <span>MY PAGE & VIP PASS</span>
        </h2>
        <p className="text-xs text-gray-400 font-mono">会員証・保有ポイント管理・ログイン</p>
      </div>

      {!currentUser ? (
        /* Login & Quick Join Card */
        <div className="space-y-4">
          {/* Auth Error Banner */}
          {authError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold text-white text-xs">{authError}</p>
                <p className="text-[11px] text-gray-300">
                  下の「ニックネームで即時参加」ならログイン不要で今すぐ500ptが使えます。
                </p>
              </div>
              <button 
                onClick={() => setAuthError(null)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="glass-panel-glow rounded-3xl p-6 text-center space-y-5 border border-neon-pink/40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-pink to-neon-purple mx-auto flex items-center justify-center shadow-neon-pink">
              <Gift className="w-8 h-8 text-white" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 bg-neon-pink/20 border border-neon-pink/50 text-neon-pink px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider mb-2">
                <Sparkles className="w-3 h-3" /> WELCOME 500 PT
              </div>
              <h3 className="text-lg font-extrabold text-white">初回参加で 500 PT プレゼント！</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
                デジタル会員証（VIP PASS）が即時発行され、フロアのDJやアーティストへすぐに投げ銭できます。
              </p>
            </div>

            {/* Method 1: Google Login */}
            <div className="space-y-2 pt-1">
              <button
                onClick={signInWithGoogle}
                className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-95 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Googleアカウントでログイン</span>
              </button>
              <p className="text-[10px] text-gray-400">
                ※ Googleアカウントのアイコンとお名前が自動反映されます
              </p>
            </div>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-dark-card px-3 text-[11px] font-mono text-gray-400">
                  または 登録不要ですぐ使う
                </span>
              </div>
            </div>

            {/* Method 2: Quick Guest Nickname Join */}
            <form onSubmit={handleQuickJoin} className="space-y-3 bg-dark-bg/60 border border-dark-border/80 p-4 rounded-2xl text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neon-cyan">
                <Zap className="w-4 h-4 text-neon-cyan" />
                <span>ニックネームで即時参加（登録・パスワード不要）</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                LINE内ブラウザや「今すぐチップを贈りたい」方は、お名前を入力するだけで1秒でVIPパスを発行できます。
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="例: サウンド好き / DJ Taku"
                  maxLength={20}
                  className="flex-1 bg-dark-surface border border-dark-border focus:border-neon-cyan text-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingQuickJoin}
                  className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/60 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                >
                  <span>参加</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Logged In User Profile & VIP Pass */
        <div className="space-y-5">
          {/* User Profile Header Card */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={userProfile?.photoURL || currentUser.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-neon-pink object-cover"
              />
              <div>
                <h3 className="text-base font-extrabold text-white">{userProfile?.displayName || currentUser.displayName}</h3>
                <p className="text-[10px] text-gray-400 font-mono">{userProfile?.email || "Google Authenticated"}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="text-xs font-mono text-gray-400 hover:text-red-400 flex items-center gap-1 p-2 rounded-xl bg-dark-bg/60 border border-dark-border"
            >
              <LogOut className="w-4 h-4" />
              <span>ログアウト</span>
            </button>
          </div>

          {/* Hologram VIP Pass Component */}
          <QRCodeDisplay userProfile={userProfile} />

          {/* Test Bonus Points Action */}
          <div className="bg-dark-surface border border-dark-border p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles className="w-4 h-4 text-neon-yellow" />
              <span>動作確認用ボーナス (300pt追加)</span>
            </div>
            <button
              onClick={handleAddBonusPoints}
              className="bg-neon-purple/20 hover:bg-neon-purple/40 border border-neon-purple text-neon-yellow font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              + 300 PT
            </button>
          </div>

          {/* History Section */}
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-neon-cyan" />
              <span>あなたのTip送金履歴</span>
            </h3>

            {userTips.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">まだTip送金履歴がありません。</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userTips.map((tip, idx) => (
                  <div key={idx} className="bg-dark-bg/60 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neon-pink">{tip.toArtistName}</span>
                      <span className="text-[10px] text-gray-400 block">{tip.message || "No message"}</span>
                    </div>
                    <span className="font-mono font-bold text-neon-yellow">-{tip.amount} PT</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
