import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { sendTipTransaction } from "../firebase/services";
import { Sparkles, Heart, CheckCircle2, AlertCircle, X, Send, Info, Copy, Check, Coins } from "lucide-react";
import confetti from "canvas-confetti";

export default function TipModal({ artist, initialMode = "paypay", onClose, onSuccess }) {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  
  // モード: アーティスト指定時は 'paypay'（直接実質支援）または 'point'（ゲーム内トークン）
  const [activeTab, setActiveTab] = useState(
    !artist ? "paypay" : initialMode === "point" ? "point" : "paypay"
  );

  const [amount, setAmount] = useState(500);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetAmounts = [100, 300, 500, 1000, 3000];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff2a85", "#00f0ff", "#9d4edd", "#ffd166"]
    });
  };

  const handleCopyKeyword = (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Copy error:", err);
    }
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

  const memoKeyword = artist?.supportGoal?.memoKeyword || artist?.name || "7TH GARDEN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-dark-card border border-red-500/40 rounded-3xl p-5 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
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
              <h3 className="text-xl font-extrabold text-white">POINT TIP SENT!</h3>
              <p className="text-xs text-neon-cyan font-mono mt-1">
                {artist?.name} へ {amount} PT を贈りました！
              </p>
            </div>
            <p className="text-xs text-gray-300 bg-dark-bg/80 p-3 rounded-2xl border border-dark-border italic">
              "{message || "応援しています！"}"
            </p>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-left text-gray-300 space-y-1">
              <span className="font-bold text-red-400 block">💡 アーティストを実質的に支えるには？</span>
              <p className="text-[11px]">
                アプリ内ポイントは演出トークンです。カメラレンズや拠点整備などの自己実現を直接資金支援するには、PayPay送金をご利用ください。
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold py-3 rounded-xl shadow-neon-pink transition-all"
            >
              閉じる
            </button>
          </div>
        ) : !artist ? (
          /* =========================================================================
             Mode A: Event-wide PayPay Donation (全体応援)
             ========================================================================= */
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
              <div className="relative w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl shadow-2xl border-2 border-red-500/60 flex items-center justify-center">
                <img
                  src="/paypay-qr.png"
                  alt="PayPay 投げ銭 QRコード"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <p className="text-xs text-gray-200 font-bold">
                金額は自由です（例: 300円、500円、1,000円など）
              </p>
            </div>

            {/* Instructions Steps */}
            <div className="bg-dark-surface border border-dark-border p-3 rounded-2xl text-left text-xs font-mono space-y-2">
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
          /* =========================================================================
             Mode B: Artist Specific Support (自己実現PR & PayPay直結)
             ========================================================================= */
          <div className="space-y-4">
            {/* Header: Artist Info */}
            <div className="flex items-center gap-3 border-b border-dark-border pb-3">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-12 h-12 rounded-xl object-cover border border-neon-pink shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neon-pink font-mono font-bold block truncate">
                    {artist.roleLabel || "ARTIST"}
                  </span>
                  {artist.supportGoal?.tag && (
                    <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-neon-purple/30 text-neon-cyan border border-neon-purple/50">
                      {artist.supportGoal.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white truncate">{artist.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono truncate">{artist.genre}</p>
              </div>
            </div>

            {/* Tabs Switcher: PayPay (推奨) vs Point (演出用) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-dark-bg rounded-2xl border border-dark-border">
              <button
                type="button"
                onClick={() => setActiveTab("paypay")}
                className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "paypay"
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>PayPayで支援 (推奨)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("point")}
                className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "point"
                    ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-neon-pink"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>ゲーム内PT (演出)</span>
              </button>
            </div>

            {activeTab === "paypay" ? (
              /* TAB 1: PayPay実質直接支援 (自己実現枠直結) */
              <div className="space-y-3.5 animate-fadeIn">
                {/* 自己実現の枠 (SUPPORT GOAL) または 通常の直接支援案内 */}
                {artist.supportGoal ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/40 via-dark-card to-pink-950/40 border border-red-500/50 space-y-1.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-red-400 flex items-center gap-1">
                        🎯 アーティストの自己実現ゴール
                      </span>
                      {artist.supportGoal.targetAmount && (
                        <span className="text-[10px] font-mono font-extrabold text-neon-yellow">
                          目標: {artist.supportGoal.targetAmount}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-white leading-snug">
                      {artist.supportGoal.title}
                    </h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {artist.supportGoal.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-red-950/30 via-dark-card to-pink-950/30 border border-red-500/30 text-left space-y-1">
                    <span className="text-[10px] font-mono font-bold text-red-400 block">
                      DIRECT ARTIST SUPPORT
                    </span>
                    <p className="text-xs font-bold text-white">
                      {artist.name} への直接投げ銭・ドネーション
                    </p>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      PayPayを通じてアーティストの活動・表現を直接資金支援できます。
                    </p>
                  </div>
                )}

                {/* PayPay QR Code Display */}
                <div className="bg-dark-bg/90 border border-red-500/40 p-3 rounded-2xl text-center space-y-2">
                  <div className="relative w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl shadow-xl border-2 border-red-500/60 flex items-center justify-center">
                    <img
                      src="/paypay-qr.png"
                      alt="PayPay 投げ銭 QRコード"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-gray-200 font-bold">
                    送金額は自由です（例: 300円、500円、1,000円、3,000円〜）
                  </p>
                </div>

                {/* 重要：PayPayメモ欄入力案内 & ワンタップコピー */}
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-2 text-left">
                  <div className="flex items-start gap-1.5 text-xs text-red-300 font-bold">
                    <Info className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>【重要】PayPay送金時のメッセージ（メモ）入力</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    PayPayの送金画面にある<strong>「メッセージ」または「メモ」</strong>欄に、以下のキーワードを入力して送金してください。集まった支援金が確実に<strong>{artist.name}</strong>へ届けられます。
                  </p>

                  <div className="flex items-center justify-between p-2.5 bg-dark-bg/90 border border-red-500/30 rounded-xl">
                    <div>
                      <span className="text-[9px] text-gray-400 font-mono block">メモ用キーワード</span>
                      <span className="font-mono font-black text-sm text-neon-yellow tracking-wider">
                        {memoKeyword}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyKeyword(memoKeyword)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                        copied
                          ? "bg-green-600 text-white shadow-md scale-105"
                          : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "コピー完了!" : "名前をコピー"}</span>
                    </button>
                  </div>
                </div>

                {/* Send Completed Button */}
                <button
                  type="button"
                  onClick={() => {
                    triggerConfetti();
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>PayPayで送金完了・閉じる</span>
                </button>

                {/* Sub link to Point */}
                <button
                  type="button"
                  onClick={() => setActiveTab("point")}
                  className="w-full text-center text-[11px] font-mono text-gray-400 hover:text-neon-pink transition-colors py-1 block"
                >
                  会場演出用の無料ポイント（保有: {userProfile?.points || 0} PT）を送る →
                </button>
              </div>
            ) : (
              /* TAB 2: ゲーム内ポイント支援 (演出用) */
              <div className="space-y-4 animate-fadeIn">
                {/* Notice banner clarifying points vs real money */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>ゲーム内トークンについて</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    アプリ内ポイントは会場ランキングやライブ演出用トークンです。カメラレンズや拠点整備など、アーティストの自己実現を直接資金支援するには【PayPay送金】をご利用ください。
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("paypay")}
                    className="mt-1 text-[11px] font-bold text-red-400 hover:underline flex items-center gap-1"
                  >
                    <span>🔴 PayPay直接支援（実質募金）に切り替える</span>
                  </button>
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
        )}
      </div>
    </div>
  );
}
