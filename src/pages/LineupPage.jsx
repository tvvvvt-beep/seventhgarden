import React, { useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { Users, Filter, Clock } from "lucide-react";

export default function LineupPage({ artists, onOpenTipModal, onSelectArtist }) {
  const [selectedStage, setSelectedStage] = useState("ALL");

  const stages = ["ALL", ...Array.from(new Set(artists.map(a => a.stage)))];

  const filteredArtists = selectedStage === "ALL"
    ? artists
    : artists.filter(a => a.stage === selectedStage);

  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-pink" />
            <span>LINEUP & TIMETABLE</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            全{artists.length}組の出演アーティスト・特別パフォーマンス
          </p>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all border ${
              selectedStage === stage
                ? "bg-neon-pink/20 border-neon-pink text-neon-pink shadow-neon-pink"
                : "bg-dark-surface border-dark-border text-gray-400 hover:text-white"
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Artist Grid List */}
      <div className="space-y-4">
        {filteredArtists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onOpenTipModal={onOpenTipModal}
            onSelectArtist={onSelectArtist}
          />
        ))}
      </div>
    </div>
  );
}
