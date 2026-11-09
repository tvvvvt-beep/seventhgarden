import React from "react";
import { Maximize2, Calendar, MapPin, Flame } from "lucide-react";

// ============================================================
// Memorial Hero — 7th Garden Vol.4 (2026-11-12)
// イベント名を主役にし、Juan Atkins は追悼企画として明確に区別する。
// 公式フライヤー画像をヒーローに埋め込み、視覚の锚＋実際の出演者像を提示。
// （旧 AtkinsHeroText: JUAN ATKINS を最大タイポで出し、出演者と誤読された）
// ============================================================

export default function MemorialHero({
  onOpenModal,
  entranceFee = "Charge Free",
  artists = [],
}) {
  const officialFlyerUrl = "/promo/7th_garden_1112_flyer.jpg";

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-neon-pink/30">
      {/* layered background: deep gradient + neon radial glows + faint scanlines */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#120a1e] via-[#0b1220] to-[#0a0f1a]" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-neon-pink/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-neon-cyan/15 blur-[90px] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(148,215,255,0.6) 0px, rgba(148,215,255,0.6) 1px, transparent 1px, transparent 4px)",
        }}
      />

      <div className="relative px-5 py-8 sm:py-10">
        {/* edition badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 text-[10px] sm:text-[11px] font-mono font-black tracking-[0.3em] text-cyan-100">
            <Flame className="w-3 h-3 text-neon-pink" />
            MEMORIAL EDITION
            <Flame className="w-3 h-3 text-neon-pink" />
          </span>
        </div>

        {/* main headline = the EVENT (not a person) */}
        <div className="text-center mb-1">
          <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight bg-gradient-to-r from-white via-neon-pink to-neon-cyan bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(236,72,153,0.45)]">
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
          className="group relative block w-full max-w-[300px] mx-auto mt-5 mb-4 rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_30px_rgba(157,78,221,0.35)] hover:shadow-[0_0_45px_rgba(236,72,153,0.5)] transition-all active:scale-[0.98]"
        >
          <img
            src={officialFlyerUrl}
            alt="7th GARDEN Vol.4 公式フライヤー — 出演ラインナップ"
            className="w-full h-auto"
            loading="eager"
          />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-mono font-bold text-cyan-100">
            <Maximize2 className="w-3 h-3" />
            拡大
          </span>
        </button>

        {/* date / venue chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] sm:text-xs mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg/80 border border-neon-pink/30 text-white font-bold">
            <Calendar className="w-3.5 h-3.5 text-neon-pink" />
            11/12 (THU) 2026 · 18:00 → 24:00
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg/80 border border-neon-cyan/30 text-gray-200 font-bold">
            <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
            Compufunk Records &amp; BAR SPACE (OSAKA)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-neon-purple/20 border border-neon-purple/50 text-neon-yellow font-black">
            {entranceFee}
          </span>
        </div>

        {/* real lineup chips — kills the "who is performing?" misread */}
        {artists.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {artists.map((a) => (
              <span
                key={a.id}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] sm:text-[11px] font-bold text-gray-100"
              >
                {a.name}
              </span>
            ))}
          </div>
        )}

        {/* memorial strip — clearly a tribute, NOT a performer entry */}
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-3.5 text-center">
          <p className="text-[10px] font-mono font-bold tracking-[0.4em] text-gray-400 mb-1">
            🕯 IN MEMORIAM
          </p>
          <p className="text-sm sm:text-base font-black text-gray-100 mb-0.5">
            JUAN ATKINS
            <span className="text-[10px] sm:text-xs font-mono text-gray-400 ml-2">1960 — 2026 · DETROIT TECHNO PIONEER</span>
          </p>
          <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed mt-1.5">
            本イベントはアトキンスへの追悼企画です（本人の出演はありません）。
            「テクノロジー」を発明し、未来の音を先に見ていた男に捧ぐ。
            音だけが、この庭に残る。
          </p>
        </div>
      </div>
    </div>
  );
}
