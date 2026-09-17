import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { sendTipTransaction } from "../firebase/services";
import { Heart, CheckCircle2, AlertCircle, X, Send, Info, Copy, Check, Coins, PartyPopper, Users, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";

export const PAYPAY_TRANSFER_URL = "https://qr.paypay.ne.jp/p2p01_PRYRSpRaMYAWkg07";

export default function TipModal({ artist, initialMode = "paypay", onClose, onSuccess, onNavigateToLineup }) {
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
            {/* 送金先ヘッダー: 誰に送るのかを明確化 */}
            <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 p-0.5 rounded-2xl shadow-neon-pink">
              <div className="bg-dark-card/95 rounded-[14px] p-3 flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shrink-0">
                  <Heart className="w-6 h-6 fill-white text-white animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-red-400 font-mono font-bold block">
                    ▼ 送金先
                  </span>
                  <h3 className="text-base font-black text-white truncate">
                    7TH GARDEN イベント全体
                  </h3>
                  <p className="text-[11px] text-gray-300">
                    フロア空間演出・音響・コミュニティ運営への直接応援
                  </p>
                </div>
              </div>
            </div>

            {/* PayPay QR Code Display (盛り上げネオン・オーラ演出) */}
            <div className="bg-dark-bg/95 border border-red-500/50 p-4 rounded-3xl space-y-3 shadow-2xl">
              <div className="flex items-center justify-center gap-1.5">
                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-mono text-[10px] font-black rounded-full shadow-lg tracking-wider flex items-center gap-1">
                  🔥 7TH GARDEN BOOST QR 🔥
                </span>
              </div>

              {/* Glowing Aura + QR Frame */}
              <div className="relative w-52 h-52 mx-auto flex items-center justify-center my-1">
                {/* Multi-color ambient animated glowing aura */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500 via-neon-pink to-purple-600 rounded-3xl blur-md opacity-80 animate-pulse" />
                
                {/* QR Card container */}
                <div className="relative w-full h-full bg-white p-3 rounded-2xl shadow-2xl border-2 border-red-500 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-1.5 left-2 right-2 bg-red-600 text-white text-[9px] font-black font-mono py-0.5 rounded flex items-center justify-center gap-1 shadow">
                    <Heart className="w-2.5 h-2.5 fill-white" />
                    <span>7TH GARDEN 投げ銭 QR</span>
                  </div>
                  <a
                    href={PAYPAY_TRANSFER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex items-center justify-center cursor-pointer group"
                    title="PayPayアプリを開く"
                  >
                    <img
                      src="/paypay-qr.png"
                      alt="PayPay 投げ銭 QRコード"
                      className="w-full h-full object-contain pt-3 group-hover:scale-105 transition-transform"
                    />
                  </a>
                </div>
              </div>

              {/* スマホ直接送金リンク */}
              <a
                href={PAYPAY_TRANSFER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md border border-red-400/40"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>📱 スマホの方はタップでPayPayを開く</span>
              </a>

              {/* 乾杯・ブーストの目安目安 */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-mono text-gray-300 font-bold">
                  ✨ 一杯奢る感覚で気軽に投げ銭！（金額自由） ✨
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-dark-surface/90 border border-white/10">
                    <span className="text-base block">🍸</span>
                    <span className="text-[11px] font-black text-white font-mono block">¥300</span>
                    <span className="text-[8px] text-gray-400 font-bold">乾杯ドリンク</span>
                  </div>
                  <div className="p-2 rounded-xl bg-dark-surface/90 border border-white/10">
                    <span className="text-base block">🔥</span>
                    <span className="text-[11px] font-black text-white font-mono block">¥500</span>
                    <span className="text-[8px] text-gray-400 font-bold">フロアブースト</span>
                  </div>
                  <div className="p-2 rounded-xl bg-dark-surface/90 border border-pink-500/40 bg-pink-500/10">
                    <span className="text-base block">🚀</span>
                    <span className="text-[11px] font-black text-neon-yellow font-mono block">¥1,000</span>
                    <span className="text-[8px] text-pink-300 font-bold">空間演出支援</span>
                  </div>
                  <div className="p-2 rounded-xl bg-dark-surface/90 border border-purple-500/40 bg-purple-500/10">
                    <span className="text-base block">👑</span>
                    <span className="text-[11px] font-black text-neon-cyan font-mono block">¥3,000~</span>
                    <span className="text-[8px] text-purple-300 font-bold">VIPパトロン</span>
                  </div>
                </div>
              </div>

              {/* 盛り上げクラッカーボタン */}
              <button
                type="button"
                onClick={triggerConfetti}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-neon-purple/30 to-pink-500/30 hover:from-neon-purple/50 hover:to-pink-500/50 border border-neon-purple/40 text-neon-yellow font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <PartyPopper className="w-4 h-4 text-neon-yellow" />
                <span>🎉 クラッカーを鳴らしてフロアを祝う！ (タップ)</span>
              </button>
            </div>

            {/* 各アーティスト個別への送金案内 */}
            <div className="bg-gradient-to-br from-neon-purple/20 via-pink-500/15 to-neon-cyan/20 border border-neon-pink/40 p-3.5 rounded-2xl text-left space-y-2.5 shadow-lg">
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none p-1 rounded-lg bg-neon-pink/20 border border-neon-pink/40 shrink-0">💡</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-neon-yellow flex items-center gap-1">
                    <span>各アーティスト（出演者）へ送金したい方へ</span>
                  </h4>
                  <p className="text-[11px] text-gray-200 mt-1 leading-relaxed">
                    このQRコードは<span className="text-white font-bold">「イベント全体への支援」</span>です。
                    DJ DUNE（レンズ購入支援）やKASSIS（福井・大阪拠点整備）など、<span className="text-neon-pink font-bold">それぞれのアーティストへ送金したい場合</span>は、
                    <strong>「出演者一覧」</strong>やトップページの各カードにある
                    <span className="inline-block px-1.5 py-0.5 mx-1 rounded bg-red-600 text-white font-mono text-[10px] font-bold shadow">PayPayで応援</span>
                    ボタンを押してください。
                  </p>
                </div>
              </div>

              {onNavigateToLineup && (
                <button
                  type="button"
                  onClick={onNavigateToLineup}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-neon-pink/30 to-neon-purple/40 hover:from-neon-pink/50 hover:to-neon-purple/60 border border-neon-pink text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>出演者一覧から推しを選んでPayPay応援する →</span>
                </button>
              )}
            </div>

            {/* Instructions Steps */}
            <div className="bg-dark-surface border border-dark-border p-3 rounded-2xl text-left text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-1.5 text-neon-cyan font-bold">
                <Info className="w-4 h-4" />
                <span>PayPay 投げ銭の送金手順</span>
              </div>
              <ol className="space-y-1 text-[11px] text-gray-300 list-decimal list-inside leading-relaxed">
                <li>PayPayアプリを開き「スキャン」をタップ</li>
                <li>上のQRコードをスキャン</li>
                <li>お好きな金額を入力して送金完了！</li>
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

                {/* 送金先ヘッダー: 誰に送るのかを明確化 */}
                <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 p-0.5 rounded-2xl shadow-neon-pink">
                  <div className="bg-dark-card/95 rounded-[14px] p-3 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-red-500 shrink-0 shadow-md"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-red-400 font-mono font-bold block">
                          ▼ 送金先アーティスト
                        </span>
                        <h3 className="text-base font-black text-white truncate">
                          {artist.name}
                        </h3>
                      </div>
                    </div>

                    {artist.supportGoal ? (
                      <span className="px-2.5 py-1 bg-red-500/20 text-neon-yellow border border-red-500/40 rounded-xl text-[10px] font-mono font-extrabold shrink-0">
                        🎯 {artist.supportGoal.tag}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-white/10 text-gray-300 border border-white/20 rounded-xl text-[10px] font-mono font-bold shrink-0">
                        {artist.roleLabel || "ARTIST"}
                      </span>
                    )}
                  </div>
                </div>

                {/* PayPay QR Code Display (盛り上げネオン・オーラ演出) */}
                <div className="bg-dark-bg/95 border border-red-500/50 p-4 rounded-3xl space-y-3 shadow-2xl text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-mono text-[10px] font-black rounded-full shadow-lg tracking-wider flex items-center gap-1">
                      🔥 {artist.name} BOOST QR 🔥
                    </span>
                  </div>

                  {/* Glowing Aura + QR Frame */}
                  <div className="relative w-52 h-52 mx-auto flex items-center justify-center my-1">
                    {/* Multi-color ambient animated glowing aura */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-red-500 via-neon-pink to-purple-600 rounded-3xl blur-md opacity-80 animate-pulse" />
                    
                    {/* QR Card container */}
                    <div className="relative w-full h-full bg-white p-3 rounded-2xl shadow-2xl border-2 border-red-500 flex flex-col items-center justify-center overflow-hidden">
                      <div className="absolute top-1.5 left-2 right-2 bg-red-600 text-white text-[9px] font-black font-mono py-0.5 rounded flex items-center justify-center gap-1 shadow truncate">
                        <Heart className="w-2.5 h-2.5 fill-white shrink-0" />
                        <span className="truncate">{artist.name} 宛て投げ銭</span>
                      </div>
                      <a
                        href={PAYPAY_TRANSFER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center cursor-pointer group"
                        title="PayPayアプリを開く"
                      >
                        <img
                          src="/paypay-qr.png"
                          alt="PayPay 投げ銭 QRコード"
                          className="w-full h-full object-contain pt-3 group-hover:scale-105 transition-transform"
                        />
                      </a>
                    </div>
                  </div>

                  {/* スマホ直接送金リンク */}
                  <a
                    href={PAYPAY_TRANSFER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md border border-red-400/40"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>📱 スマホの方はタップでPayPayを開く</span>
                  </a>

                  {/* 乾杯・ブーストの目安目安 */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-mono text-gray-300 font-bold">
                      ✨ {artist.name} へ乾杯やブーストを送る！（金額自由） ✨
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-dark-surface/90 border border-white/10">
                        <span className="text-base block">🍸</span>
                        <span className="text-[11px] font-black text-white font-mono block">¥300</span>
                        <span className="text-[8px] text-gray-400 font-bold">乾杯ドリンク</span>
                      </div>
                      <div className="p-2 rounded-xl bg-dark-surface/90 border border-white/10">
                        <span className="text-base block">🔥</span>
                        <span className="text-[11px] font-black text-white font-mono block">¥500</span>
                        <span className="text-[8px] text-gray-400 font-bold">フロア熱気!</span>
                      </div>
                      <div className="p-2 rounded-xl bg-dark-surface/90 border border-pink-500/40 bg-pink-500/10">
                        <span className="text-base block">🚀</span>
                        <span className="text-[11px] font-black text-neon-yellow font-mono block">¥1,000</span>
                        <span className="text-[8px] text-pink-300 font-bold">
                          {artist.supportGoal ? "自己実現支援" : "大声援ブースト"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-dark-surface/90 border border-purple-500/40 bg-purple-500/10">
                        <span className="text-base block">👑</span>
                        <span className="text-[11px] font-black text-neon-cyan font-mono block">¥3,000~</span>
                        <span className="text-[8px] text-purple-300 font-bold">VIPサポーター</span>
                      </div>
                    </div>
                  </div>

                  {/* 盛り上げクラッカーボタン */}
                  <button
                    type="button"
                    onClick={triggerConfetti}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-neon-purple/30 to-pink-500/30 hover:from-neon-purple/50 hover:to-pink-500/50 border border-neon-purple/40 text-neon-yellow font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <PartyPopper className="w-4 h-4 text-neon-yellow" />
                    <span>🎉 クラッカーを鳴らして {artist.name} を祝う！ (タップ)</span>
                  </button>
                </div>

                {/* 重要：PayPayメモ欄入力案内 & ワンタップコピー */}
                <div className="p-3.5 bg-gradient-to-br from-red-950/60 to-dark-bg border-2 border-red-500/60 rounded-2xl space-y-2 text-left shadow-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-neon-yellow font-black">
                      <AlertCircle className="w-4 h-4 text-neon-yellow shrink-0" />
                      PayPay送金メモに「{memoKeyword}」と記入！
                    </span>
                    <span className="text-[9px] font-mono text-red-300 bg-red-500/30 px-2 py-0.5 rounded-full border border-red-500/50">
                      送金先を明記
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    PayPayの送金画面にある<strong>「メッセージ」または「メモ」</strong>欄に、以下のキーワードを貼り付けて送金してください。集まった支援金が確実に<strong>{artist.name}</strong>の元へ届けられます。
                  </p>

                  <div className="flex items-center justify-between p-2.5 bg-black/80 border border-red-500/50 rounded-xl">
                    <div>
                      <span className="text-[9px] text-gray-400 font-mono block">誰宛てか（入力キーワード）</span>
                      <span className="font-mono font-black text-base text-neon-yellow tracking-wider">
                        {memoKeyword}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyKeyword(memoKeyword)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
                        copied
                          ? "bg-green-600 text-white scale-105"
                          : "bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white"
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
