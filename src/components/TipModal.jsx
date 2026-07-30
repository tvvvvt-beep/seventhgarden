import React, { useState } from "react";
import { X, Sparkles, Send, AlertCircle, Heart, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/useAuth";
import { sendTipTransaction } from "../firebase/services";

export default function TipModal({ artist, onClose, onSuccess }) {
  const { currentUser, userProfile, signInWithGoogle, refreshUserProfile } = useAuth();
  
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const presetAmounts = [100, 300, 500];

  const handleSendTip = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const amount = customAmount ? parseInt(customAmount, 10) : selectedAmount;
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("有効なポイント数を入力してください。");
      return;
    }

    const currentPoints = userProfile?.points ?? 0;
    if (currentPoints < amount) {
      setErrorMessage(`ポイントが不足しています（現在: ${currentPoints}pt）`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 要件4: Firestore Transaction の呼び出し
      await sendTipTransaction({
        userId: currentUser.uid,
        userProfile,
        artistId: artist.id,
        amount,
        message: message.trim() || "LIVE SUPPORT! 🔥"
      });

      // 紙吹雪アニメーション
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF007F', '#9D4EDD', '#00F5FF', '#FFEE32']
      });

      setIsSuccess(true);
      await refreshUserProfile();
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);

    } catch (err) {
      console.error("Tip sending failed:", err);
      setErrorMessage(err.message || "送信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border border-neon-pink/40">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-dark-bg/60 border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neon-pink/20 border-2 border-neon-pink flex items-center justify-center shadow-neon-pink animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-neon-pink" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">TIP SENT!</h3>
              <p className="text-sm text-neon-cyan mt-1">{artist.name} へ送付完了</p>
            </div>
            <p className="text-xs text-gray-400">熱い応援メッセージがフロアに届きました！</p>
          </div>
        ) : (
          <div className="p-5">
            {/* Header / Artist Info */}
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-dark-border">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-12 h-12 rounded-xl object-cover border border-neon-purple"
              />
              <div>
                <span className="text-[10px] text-neon-cyan font-mono font-bold tracking-wider">SUPPORT ARTIST</span>
                <h3 className="text-base font-extrabold text-white">{artist.name}</h3>
              </div>
            </div>

            {!currentUser ? (
              <div className="py-6 text-center space-y-4">
                <p className="text-xs text-gray-300">
                  ポイント投げ銭でメッセージを送るにはGoogleログインが必要です（初回500ptプレゼント！）
                </p>
                <button
                  onClick={signInWithGoogle}
                  className="w-full bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold text-sm py-3 rounded-xl shadow-neon-pink hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Googleでログインして投げ銭</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendTip} className="space-y-4">
                {/* User Current Balance Info */}
                <div className="bg-dark-bg/80 border border-dark-border rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">あなたの保有ポイント</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-sm text-neon-yellow">
                    <Sparkles className="w-4 h-4 fill-neon-yellow" />
                    <span>{userProfile?.points ?? 0}</span>
                    <span className="text-xs text-gray-400">PT</span>
                  </div>
                </div>

                {/* Amount Select Buttons */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-2">
                    送付ポイント数
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {presetAmounts.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all border ${
                          selectedAmount === amt && !customAmount
                            ? "bg-neon-pink/20 border-neon-pink text-neon-pink shadow-neon-pink"
                            : "bg-dark-surface border-dark-border text-gray-400 hover:text-white"
                        }`}
                      >
                        {amt} PT
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Amount Input */}
                  <input
                    type="number"
                    placeholder="カスタムポイントを入力"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                    max={userProfile?.points ?? 500}
                    className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan text-white text-xs px-3 py-2.5 rounded-xl font-mono focus:outline-none transition-all"
                  />
                </div>

                {/* Support Message Input */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5">
                    応援メッセージ (任意)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={100}
                    placeholder="フロアからの熱いメッセージを！例: 最高のDJセット！🔥"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink text-white text-xs p-3 rounded-xl focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-2.5 flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan hover:opacity-95 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">送金処理中 (Transaction)...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{customAmount || selectedAmount} PT を送金する</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
