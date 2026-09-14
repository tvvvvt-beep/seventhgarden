import React from "react";
import { Sparkles, Heart, Clock, ChevronRight } from "lucide-react";

export default function ArtistCard({ artist, onOpenTipModal, onSelectArtist }) {
  const displayTime = artist.time === "時間未定" ? "TBA (未定)" : artist.time;

  return (
    <div className="glass-panel hover:border-neon-pink/50 transition-all duration-300 rounded-2xl overflow-hidden group border border-dark-border relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/5 via-transparent to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="p-4 flex gap-4 items-start">
        {/* Artist Image Avatar */}
        <div 
          onClick={() => onSelectArtist(artist)}
          className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-neon-purple/40 group-hover:scale-105 transition-transform"
        >
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold text-neon-cyan flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {displayTime}
          </span>
        </div>

        {/* Artist Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 
              onClick={() => onSelectArtist(artist)}
              className="text-base font-extrabold text-white truncate hover:text-neon-pink cursor-pointer transition-colors"
            >
              {artist.name}
            </h3>
            {artist.roleLabel && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink border border-neon-pink/40 font-bold shrink-0">
                {artist.roleLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neon-purple/20 text-neon-cyan border border-neon-purple/30 font-bold shrink-0">
              {displayTime} {artist.duration && artist.duration !== "ALL NIGHT" ? `(${artist.duration})` : ""}
            </span>
            <p className="text-[11px] text-gray-300 font-mono truncate font-medium">
              {artist.genre}
            </p>
          </div>

          <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-2.5">
            {artist.bio}
          </p>

          {/* Self-Realization Goal Mini Preview */}
          {artist.supportGoal && (
            <div 
              onClick={() => onSelectArtist(artist)}
              className="mb-3 p-2 rounded-xl bg-red-950/25 border border-red-500/30 hover:border-red-500/60 cursor-pointer transition-all flex items-start gap-1.5 group/goal"
            >
              <span className="text-[11px] shrink-0 mt-0.5">🎯</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold text-red-400">自己実現ゴール</span>
                  {artist.supportGoal.tag && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-300">
                      {artist.supportGoal.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-white truncate group-hover/goal:text-red-300 transition-colors">
                  {artist.supportGoal.title}
                </p>
              </div>
            </div>
          )}

          {/* Points & Support Button Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
            <div className="flex items-center gap-1 font-mono text-xs text-neon-yellow">
              <Sparkles className="w-3.5 h-3.5 fill-neon-yellow text-neon-yellow" />
              <span className="font-extrabold">{artist.totalPoints?.toLocaleString() ?? 0}</span>
              <span className="text-[10px] text-gray-400">PT</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectArtist(artist)}
                className="text-xs text-gray-400 hover:text-white font-mono px-2 py-1 rounded-lg transition-colors flex items-center gap-0.5"
              >
                <span>詳細</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => onOpenTipModal(artist, "paypay")}
                className="flex items-center gap-1 bg-gradient-to-r from-red-500 via-pink-600 to-neon-purple hover:opacity-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
                <span>PayPay / 応援</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
