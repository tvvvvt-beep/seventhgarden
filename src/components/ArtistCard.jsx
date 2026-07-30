import React from "react";
import { Sparkles, Clock, MapPin, Heart, ChevronRight } from "lucide-react";

export default function ArtistCard({ artist, onOpenTipModal, onSelectArtist }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden group hover:border-neon-purple/50 transition-all duration-300 shadow-lg">
      {/* Top Image Banner */}
      <div 
        className="relative h-44 w-full overflow-hidden cursor-pointer"
        onClick={() => onSelectArtist(artist)}
      >
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/40 to-transparent" />
        
        {/* Stage Badge */}
        <div className="absolute top-3 left-3 bg-dark-bg/80 backdrop-blur-md border border-neon-cyan/50 text-neon-cyan text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-neon-cyan">
          <MapPin className="w-3 h-3" />
          <span>{artist.stage}</span>
        </div>

        {/* Time Badge */}
        <div className="absolute top-3 right-3 bg-dark-bg/80 backdrop-blur-md text-gray-200 text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
          <Clock className="w-3 h-3 text-neon-pink" />
          <span>{artist.time}</span>
        </div>

        {/* Total Tips Badge */}
        <div className="absolute bottom-2 right-3 bg-neon-purple/90 backdrop-blur-md text-white text-xs font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-neon-purple">
          <Sparkles className="w-3.5 h-3.5 fill-neon-yellow text-neon-yellow" />
          <span>{(artist.totalPoints || 0).toLocaleString()} PT</span>
        </div>
      </div>

      {/* Artist Detail Info */}
      <div className="p-4">
        <div 
          className="cursor-pointer mb-2"
          onClick={() => onSelectArtist(artist)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white group-hover:text-neon-pink transition-colors">
              {artist.name}
            </h3>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-neon-pink transition-colors" />
          </div>
          <p className="text-xs text-neon-cyan font-mono font-medium tracking-wide">
            {artist.genre}
          </p>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {artist.bio}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-dark-border/60">
          <button
            onClick={() => onOpenTipModal(artist)}
            className="flex-1 bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-neon-pink active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>ポイント投げ銭</span>
          </button>
          
          <button
            onClick={() => onSelectArtist(artist)}
            className="bg-dark-surface hover:bg-dark-border border border-gray-700 text-gray-300 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all"
          >
            詳細
          </button>
        </div>
      </div>
    </div>
  );
}
