import React from "react";
import { Maximize2 } from "lucide-react";

// ============================================================
// Atkins Hero — Juan Atkins 追悼テキストのみヒーロー
// 7th Garden Vol.4 @ Compufunk Records & BAR SPACE (OSAKA)
// 3Dなし・文章のみ（AtkinsHero3D.jsx は差し戻し用に残置）
// ============================================================

export default function AtkinsHeroText({ onOpenModal, entranceFee = "Charge Free" }) {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-cyan-200/25 shadow-2xl">
      {/* subtle static gradient wash — CSS only, no WebGL */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/90 via-[#0a0f1a]/80 to-[#120a1a]/90 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(148,215,255,0.6) 0px, rgba(148,215,255,0.6) 1px, transparent 1px, transparent 4px)",
        }}
      />

      <div className="relative px-5 py-10 sm:py-14 text-center">
        <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.6em] text-cyan-200/90 mb-3">
          IN MEMORIAM
        </p>
        <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight bg-gradient-to-b from-white via-cyan-50 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(148,215,255,0.35)] mb-2">
          JUAN ATKINS
        </h1>
        <p className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-gray-400 mb-6">
          1960 — 2026 · DETROIT TECHNO PIONEER
        </p>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm mx-auto mb-7 bg-dark-card/60 backdrop-blur-sm px-4 py-3.5 rounded-2xl border border-white/5">
          「テクノロジー」を発明し、未来の音を先に見ていた男。
          7th GARDEN Vol.4 は、デトロイト・テクノの先駆者
          ホアン・アトキンスへの追悼を込めて開催します。
          音だけが、この庭に残る。
        </p>

        <div className="flex flex-col gap-1.5 font-mono text-[11px] sm:text-xs text-gray-300 mb-6">
          <span className="text-cyan-50 font-bold tracking-widest">
            7th GARDEN Vol.4 — 11/12 (THU) 2026 · 18:00 → 24:00
          </span>
          <span className="tracking-wider">
            Compufunk Records &amp; BAR SPACE (OSAKA) — {entranceFee}
          </span>
        </div>

        <button
          onClick={() => onOpenModal && onOpenModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-100/15 hover:bg-cyan-100/25 backdrop-blur-md border border-cyan-100/30 text-cyan-50 font-mono text-[11px] font-bold shadow-lg transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>公式ポスター拡大</span>
        </button>
      </div>
    </div>
  );
}
