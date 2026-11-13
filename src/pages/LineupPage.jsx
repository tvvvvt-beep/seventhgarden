import React, { useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { Clock, Disc, Sparkles, History, Calendar, MapPin, Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PAST_EVENTS, EVENT_INFO } from "../firebase/mockData";

export default function LineupPage({ artists, onOpenTipModal, onSelectArtist, activeEventTab = "vol_4", setActiveEventTab }) {
  const [currentEvent, setCurrentEvent] = useState(activeEventTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState(null);

  React.useEffect(() => {
    setCurrentEvent(activeEventTab);
  }, [activeEventTab]);

  const handleTabChange = (eventId) => {
    setCurrentEvent(eventId);
    if (setActiveEventTab) {
      setActiveEventTab(eventId);
    }
  };

  const isUpcoming = currentEvent === "vol_4_next";
  const pastEvent = PAST_EVENTS.find(e => e.id === currentEvent) || null;
  const archivePhotos = pastEvent?.photos || [];

  const currentArtistsList = isUpcoming ? artists : (pastEvent?.artists || []);

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
            {isUpcoming ? "次回 11/12 (THU) 出演アーティスト＆タイムテーブル" : `${pastEvent?.title} アーカイブ`}
          </p>
        </div>
      </div>

      {/* Event Selection Tabs */}
      <div className={`grid gap-2 p-1.5 bg-dark-surface rounded-2xl border border-dark-border ${PAST_EVENTS.length > 2 ? "grid-cols-2" : PAST_EVENTS.length > 1 ? "grid-cols-3" : "grid-cols-2"}`}>
        <button
          onClick={() => handleTabChange("vol_4_next")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
            isUpcoming
              ? "bg-gradient-to-r from-neon-pink/80 to-neon-purple/80 text-white shadow-neon-pink"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vol.4 (次回 11/12)</span>
        </button>

        {PAST_EVENTS.map((ev) => (
          <button
            key={ev.id}
            onClick={() => handleTabChange(ev.id)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
              !isUpcoming && currentEvent === ev.id
                ? "bg-gradient-to-r from-purple-800 to-indigo-800 text-white shadow-neon-purple border border-neon-purple/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{ev.vol} ({ev.date.slice(5, 10)})</span>
          </button>
        ))}
      </div>

      {/* Archive Notice Banner (If a past event selected) */}
      {pastEvent && (
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

      {/* Event Photo Gallery (archive entries with photos) */}
      {archivePhotos.length > 0 && !searchQuery && (
        <div className="rounded-2xl bg-dark-card/50 border border-dark-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-neon-cyan">
              <Camera className="w-3.5 h-3.5" />
              EVENT PHOTOS — {pastEvent.vol} ARCHIVE
            </span>
            <span className="text-[10px] font-mono text-gray-500">{archivePhotos.length} PHOTOS</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {archivePhotos.map((src, i) => (
              <button
                key={src}
                onClick={() => setLightboxIdx(i)}
                className="aspect-square rounded-lg overflow-hidden border border-dark-border hover:border-neon-pink/60 transition-all"
              >
                <img
                  src={src}
                  alt={`${pastEvent.id} photo ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coming Next Banner (Vol.4 lineup TBD) */}
      {isUpcoming && currentArtistsList.length === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/50 via-dark-card to-purple-950/50 border border-neon-pink/40 text-center space-y-2 shadow-neon-pink">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink border border-neon-pink/40 inline-block">
            COMING NEXT
          </span>
          <h3 className="text-lg font-black text-white tracking-wider">7th GARDEN Vol.4</h3>
          <span className="block text-5xl font-black leading-none bg-gradient-to-b from-white to-neon-pink bg-clip-text text-transparent">11<span className="text-neon-cyan mx-0.5">/</span>12</span>
          <p className="text-xs font-mono text-gray-300 tracking-[0.25em] mt-1">2026 — THURSDAY @ Compufunk Records &amp; BAR (OSAKA)</p>
          <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">
            ラインナップ・タイムテーブルは準備中です。<br />確定次第このページに反映されます。
          </p>
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
          <span>{isUpcoming ? "VOL.4 — 11/12 (THU) / LINEUP: 準備中" : `${pastEvent?.vol} LINEUP (全${(pastEvent?.artists || []).length}組)`}</span>
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

        {/* Closing / Buffer info slot (past events only) */}
        {!isUpcoming && !searchQuery && pastEvent?.id === "vol_3" && (
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

      {/* Photo Lightbox */}
      {lightboxIdx !== null && archivePhotos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-dark-surface/80 text-gray-300 hover:text-white border border-dark-border"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + archivePhotos.length) % archivePhotos.length); }}
            className="absolute left-2 sm:left-6 p-2 rounded-full bg-dark-surface/80 text-gray-300 hover:text-white border border-dark-border"
            aria-label="前へ"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img
            src={archivePhotos[lightboxIdx]}
            alt={`archive photo ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[82vh] rounded-xl shadow-neon-purple object-contain"
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-mono text-gray-400 bg-dark-surface/80 px-3 py-1 rounded-full border border-dark-border">
            {lightboxIdx + 1} / {archivePhotos.length}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % archivePhotos.length); }}
            className="absolute right-2 sm:right-6 p-2 rounded-full bg-dark-surface/80 text-gray-300 hover:text-white border border-dark-border"
            aria-label="次へ"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
