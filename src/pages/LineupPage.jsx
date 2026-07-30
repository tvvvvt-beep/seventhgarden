import React, { useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { Clock, Disc, Sparkles } from "lucide-react";

export default function LineupPage({ artists, onOpenTipModal, onSelectArtist }) {
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルターのみ
  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Disc className="w-5 h-5 text-neon-pink animate-[spin_12s_linear_infinite]" />
          <span>LINEUP & TIMETABLE</span>
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          出演アーティスト・タイムテーブル（18:00 - 24:00）
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="アーティスト名・ジャンルで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Artists Count & Status */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-dark-border pb-2">
        <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>TIME TABLE</span>
        </span>
        <span>{filteredArtists.length} ACTS</span>
      </div>

      {/* Artist Cards List */}
      <div className="space-y-4">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-10 glass-panel rounded-2xl">
            <p className="text-xs text-gray-400">該当するアーティストが見つかりませんでした。</p>
          </div>
        ) : (
          filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onOpenTipModal={onOpenTipModal}
              onSelectArtist={onSelectArtist}
            />
          ))
        )}
      </div>
    </div>
  );
}
