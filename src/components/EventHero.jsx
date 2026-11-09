import React from "react";
import { Maximize2, Calendar, MapPin, Sparkles } from "lucide-react";

// ============================================================
// Event Hero — 7th Garden Vol.4 (2026-11-12)
// イベント名を主役にしたアニメーション入りヒーロー。
// 2026-11-09 桜井さん要望：本イベントは追悼企画ではないため故人への言及表示は全面撤去。
// 「地味」指摘を受け、グローのドリフト・タイトルシマー・rise-in の動きを導入。
// ============================================================

export default function EventHero({
  onOpenModal,
  entranceFee = "Charge Free",
  artists = [],
}) {
  const officialFlyerUrl = "/promo/7th_garden_1112_flyer.jpg";

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-neon-pink/30">
      {/* layered animated background: deep gradient + drifting neon glows + drifting scanlines */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#120a1e] via-[#0b1220] to-[#0a0f1a]" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-neon-pink/25 blur-[90px] pointer-events-none animate-glowDrift" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-neon-cyan/20 blur-[90px] pointer-events-none animate-glowDrift2" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] animate-scanMove"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(148,215,255,0.6) 0px, rgba(148,215,255,0.6) 1px, transparent 1px, transparent 4px)",
        }}
      />

      <div className="relative px-5 py-8 sm:py-10">
        {/* edition badge — floats */}
        <div className="flex justify-center mb-4 animate-riseIn">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 text-[10px] sm:text-[11px] font-mono font-black tracking-[0.3em] text-cyan-100 animate-float">
            <Sparkles className="w-3 h-3 text-neon-pink" />
            7TH GARDEN VOL.4 — OSAKA
            <Sparkles className="w-3 h-3 text-neon-pink" />
          </span>
        </div>

        {/* main headline = the EVENT, animated gradient shimmer + pulsing glow */}
        <div className="text-center mb-1 animate-riseIn" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight bg-gradient-to-r from-white via-neon-pink to-neon-cyan bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer animate-titlePulse">
            7th GARDEN
          </h1>
          <p className="text-base sm:text-lg font-mono font-black tracking-[0.5em] text-gray-200 mt-1.5 ml-[0.5em]">
            VOL.4
          </p>
        </div>

        {/* official flyer — visual anchor + real lineup shown */}
        <button
          type="button"
          onClick={() => onOpenModal && onOpenModal()}
          className="group relative block w-full max-w-[300px] mx-auto mt-5 mb-4 rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_30px_rgba(157,78,221,0.35)] hover:shadow-[0_0_45px_rgba(236,72,153,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] animate-riseIn"
          style={{ animationDelay: "0.2s" }}
        >
          <img
            src={officialFlyerUrl}
            alt="7th GARDEN Vol.4 公式フライヤー — 出演ラインナップ"
            className="w-full h-auto"
            loading="eager"
          />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-mono font-bold text-cyan-100 group-hover:border-neon-cyan/60 transition-colors">
            <Maximize2 className="w-3 h-3" />
            拡大
          </span>
        </button>

        {/* date / venue chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] sm:text-xs mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg/80 border border-neon-pink/30 text-white font-bold animate-riseIn" style={{ animationDelay: "0.3s" }}>
            <Calendar className="w-3.5 h-3.5 text-neon-pink" />
            11/12 (THU) 2026 · 18:00 → 24:00
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg/80 border border-neon-cyan/30 text-gray-200 font-bold animate-riseIn" style={{ animationDelay: "0.4s" }}>
            <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
            Compufunk Records &amp; BAR SPACE (OSAKA)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-neon-purple/20 border border-neon-purple/50 text-neon-yellow font-black animate-riseIn animate-pulse-glow" style={{ animationDelay: "0.5s" }}>
            {entranceFee}
          </span>
        </div>

        {/* real lineup chips — staggered rise-in */}
        {artists.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {artists.map((a, i) => (
              <span
                key={a.id}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] sm:text-[11px] font-bold text-gray-100 hover:border-neon-pink/50 hover:bg-neon-pink/10 transition-colors animate-riseIn"
                style={{ animationDelay: `${0.55 + i * 0.07}s` }}
              >
                {a.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
