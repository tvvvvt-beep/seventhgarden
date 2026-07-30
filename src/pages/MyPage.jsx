import React from "react";
import { useAuth } from "../context/useAuth";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { LogIn, LogOut, Sparkles, User, ShieldCheck, Gift, History } from "lucide-react";

export default function MyPage({ userTips = [] }) {
  const { currentUser, userProfile, signInWithGoogle, demoLogin, logout, setUserProfile } = useAuth();

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
        /* Login Prompt Card */
        <div className="glass-panel-glow rounded-3xl p-6 text-center space-y-5 border border-neon-pink/40">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-pink to-neon-purple mx-auto flex items-center justify-center shadow-neon-pink">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white">初回ログインで 500 PT プレゼント！</h3>
            <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
              Googleアカウントでログインするとデジタル会員証が発行され、お気に入りのDJ/アーティストへ即時投げ銭できます。
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Googleアカウントでログイン</span>
            </button>

            <button
              onClick={() => demoLogin("GUEST_PARTY_VIP")}
              className="w-full bg-dark-surface hover:bg-dark-border border border-neon-cyan/40 text-neon-cyan font-mono text-xs py-2.5 rounded-xl transition-all"
            >
              ※ テスト用ワンタップゲストログイン (500pt)
            </button>
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
