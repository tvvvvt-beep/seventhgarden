import React from "react";
import { Sparkles, Heart, Clock, ChevronRight, ExternalLink } from "lucide-react";

export default function ArtistCard({ artist, onOpenTipModal, onSelectArtist }) {
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
            {artist.time.split(" - ")[0]}
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30 font-bold shrink-0">
              {artist.time}
            </span>
          </div>

          <p className="text-[11px] text-neon-cyan font-mono truncate mb-2 font-medium">
            {artist.genre}
          </p>

          <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-3">
            {artist.bio}
          </p>

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
                onClick={() => onOpenTipModal(artist)}
                className="flex items-center gap-1 bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-neon-pink transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                <span>Tipで応援</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
