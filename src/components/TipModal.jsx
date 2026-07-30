import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { sendTipTransaction } from "../firebase/services";
import { Sparkles, Heart, CheckCircle2, AlertCircle, X, Send, QrCode, Info } from "lucide-react";
import confetti from "canvas-confetti";

export default function TipModal({ artist, initialMode = "point", onClose, onSuccess }) {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  
  // モード: 'paypay' (トップページからのイベントPayPay投げ銭一発表示) | 'point' (個人のポイント投げ銭)
  const isPayPayOnly = initialMode === "paypay" || !artist;

  const [amount, setAmount] = useState(500);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const presetAmounts = [100, 300, 500, 1000, 3000];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff2a85", "#00f0ff", "#9d4edd", "#ffd166"]
    });
  };

  const handleSubmitPointTip = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("ポイント送金にはログインが必要です。マイページよりログインしてください。");
      return;
    }

    if ((userProfile?.points || 0) < amount) {
      setError(`ポイントが不足しています。（保有: ${userProfile?.points || 0} pt）`);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await sendTipTransaction({
        userId: currentUser.uid,
        userProfile,
        artistId: artist.id,
        amount,
        message
      });

      if (result.success) {
        if (result.newPoints !== undefined) {
          setUserProfile({ ...userProfile, points: result.newPoints });
        } else if (result.updatedUser) {
          setUserProfile(result.updatedUser);
        }

        setIsSuccess(true);
        triggerConfetti();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "送金処理に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-dark-card border border-neon-pink/50 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full bg-dark-bg/60 border border-dark-border transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success State (Point Tip) */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-neon-pink/20 border border-neon-pink flex items-center justify-center mx-auto text-neon-pink shadow-neon-pink">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">TIP SENT!</h3>
              <p className="text-xs text-neon-cyan font-mono mt-1">
                {artist?.name} へ {amount} PT を贈りました！
              </p>
            </div>
            <p className="text-xs text-gray-300 bg-dark-bg/80 p-3 rounded-2xl border border-dark-border italic">
              "{message || "応援しています！"}"
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold py-3 rounded-xl shadow-neon-pink transition-all"
            >
              閉じる
            </button>
          </div>
        ) : isPayPayOnly ? (
          /* Mode 1: Event Main PayPay Direct QR Modal (一発表示) */
          <div className="space-y-4 text-center">
            <div className="flex items-center gap-3 border-b border-dark-border pb-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Heart className="w-6 h-6 fill-white text-white" />
              </div>
              <div>
                <span className="text-[10px] text-red-400 font-mono font-bold block">EVENT DONATION</span>
                <h3 className="text-base font-extrabold text-white">7TH GARDEN 投げ銭</h3>
                <p className="text-[11px] text-gray-400">イベント全体・コミュニティ空間への応援</p>
              </div>
            </div>

            <div className="bg-dark-bg/90 border border-red-500/40 p-4 rounded-2xl space-y-3">
              <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-[10px] font-bold rounded-full">
                PayPay 専用 QRコード
              </span>

              {/* PayPay QR Code Display */}
              <div className="relative w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-2xl border-2 border-red-500/60 flex items-center justify-center">
                <img
                  src="/paypay-qr.png"
                  alt="PayPay 投げ銭 QRコード"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <p className="text-xs text-gray-200 font-bold">
                金額は自由です（例: 300円、500円、700円など）
              </p>
            </div>

            {/* Instructions Steps */}
            <div className="bg-dark-surface border border-dark-border p-3.5 rounded-2xl text-left text-xs font-mono space-y-2">
              <div className="flex items-center gap-1.5 text-neon-cyan font-bold mb-1">
                <Info className="w-4 h-4" />
                <span>PayPay 投げ銭の使い方</span>
              </div>
              <ol className="space-y-1.5 text-[11px] text-gray-300 list-decimal list-inside leading-relaxed">
                <li>PayPayアプリを開き「スキャン」をタップ</li>
                <li>上のQRコードをスキャン</li>
                <li>お好きな金額を入力して送金</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerConfetti();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>PayPayで応援完了・閉じる</span>
            </button>
          </div>
        ) : (
          /* Mode 2: Artist Personal Point Tip Modal (個人応援はポイントのみ) */
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-dark-border pb-4">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-12 h-12 rounded-xl object-cover border border-neon-purple shrink-0"
              />
              <div>
                <span className="text-[10px] text-neon-cyan font-mono font-bold block">SUPPORT ARTIST</span>
                <h3 className="text-base font-extrabold text-white">{artist.name}</h3>
                <p className="text-[11px] text-gray-400 font-mono">ポイントで推しDJを応援</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPointTip} className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-gray-400">投げ銭ポイント額</span>
                  <span className="text-neon-yellow font-bold">
                    保有: {userProfile?.points ?? 0} PT
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {presetAmounts.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setAmount(pt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        amount === pt
                          ? "bg-neon-pink/20 border-neon-pink text-neon-pink shadow-neon-pink"
                          : "bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono block mb-1">
                  応援メッセージ (任意)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`${artist.name} への応援コメントを入力`}
                  maxLength={100}
                  className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none resize-none h-20 font-sans"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-300 font-mono">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{amount} PT を送る</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
