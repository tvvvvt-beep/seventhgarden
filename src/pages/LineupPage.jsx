import React, { useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { Clock, Disc, Sparkles, History, Calendar, MapPin } from "lucide-react";
import { PAST_EVENTS, EVENT_INFO } from "../firebase/mockData";

export default function LineupPage({ artists, onOpenTipModal, onSelectArtist, activeEventTab = "vol_3", setActiveEventTab }) {
  const [currentEvent, setCurrentEvent] = useState(activeEventTab);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (eventId) => {
    setCurrentEvent(eventId);
    if (setActiveEventTab) {
      setActiveEventTab(eventId);
    }
  };

  const isVol3 = currentEvent === "vol_3";
  const pastEvent = PAST_EVENTS.find(e => e.id === currentEvent) || PAST_EVENTS[0];

  const currentArtistsList = isVol3 ? artists : (pastEvent?.artists || []);

  const filteredArtists = currentArtistsList.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Disc className="w-5 h-5 text-neon-pink animate-[spin_12s_linear_infinite]" />
            <span>LINEUP & ARTISTS</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            {isVol3 ? "次回 09/17 出演アーティスト＆タイムテーブル" : `${pastEvent.title} アーカイブ`}
          </p>
        </div>
      </div>

      {/* Event Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-dark-surface rounded-2xl border border-dark-border">
        <button
          onClick={() => handleTabChange("vol_3")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
            isVol3
              ? "bg-gradient-to-r from-neon-pink/80 to-neon-purple/80 text-white shadow-neon-pink"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vol.3 (次回 09/17)</span>
        </button>

        <button
          onClick={() => handleTabChange("vol_2")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
            !isVol3
              ? "bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-neon-purple border border-neon-purple/40"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Vol.2 (前回 07/30)</span>
        </button>
      </div>

      {/* Archive Notice Banner (If Vol.2 Selected) */}
      {!isVol3 && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ARCHIVED EVENT (終了)
            </span>
            <span className="text-[11px] font-mono text-gray-400">{pastEvent.date}</span>
          </div>
          <h3 className="text-sm font-extrabold text-white">{pastEvent.title}</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{pastEvent.description}</p>
          <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 pt-1 border-t border-purple-500/20">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-400" />
              {pastEvent.venue}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" />
              {pastEvent.openTime}
            </span>
          </div>
        </div>
      )}

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
          <Clock className="w-3.5 h-3.5 text-neon-pink" />
          <span>{isVol3 ? "TIMETABLE: 18:00 - 24:00 (確定)" : "VOL.2 LINEUP (全10組)"}</span>
        </span>
        <span className="bg-dark-surface px-2.5 py-0.5 rounded-full border border-dark-border">{filteredArtists.length} ACTS</span>
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

        {/* Closing / Buffer info slot (Only on Vol.3) */}
        {isVol3 && !searchQuery && (
          <div className="p-3.5 rounded-2xl bg-dark-card/40 border border-dashed border-dark-border flex items-center justify-between text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>23:25 - 24:00</span>
              <span className="text-gray-300 font-bold">クロージング / バッファ</span>
            </div>
            <span className="text-[10px] text-gray-500">35m</span>
          </div>
        )}
      </div>
    </div>
  );
}
