import React from "react";
import { ArrowLeft, Sparkles, MapPin, Clock, Heart, Globe, Share2, Music } from "lucide-react";
import RecentTipsFeed from "../components/RecentTipsFeed";

export default function ArtistDetailPage({ artist, allTips, onBack, onOpenTipModal }) {
  if (!artist) return null;

  // このアーティスト宛てのTipメッセージのみ抽出
  const artistTips = allTips.filter(t => t.toArtistId === artist.id || t.toArtistName === artist.name);

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-neon-pink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>一覧へ戻る</span>
      </button>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-neon-purple/40 shadow-2xl">
        <div className="relative h-60 w-full">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/50 to-transparent" />
          
          {/* Stage & Time Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5">
            {artist.roleLabel && (
              <span className="bg-neon-pink/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-neon-pink">
                {artist.roleLabel}
              </span>
            )}
            <span className="bg-dark-bg/80 backdrop-blur-md border border-neon-cyan/50 text-neon-cyan text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {artist.stage}
            </span>
            <span className="bg-dark-bg/80 backdrop-blur-md text-gray-200 text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
              <Clock className="w-3 h-3 text-neon-pink" />
              {artist.time} {artist.duration && artist.duration !== "ALL NIGHT" ? `(${artist.duration})` : ""}
            </span>
          </div>
        </div>

        {/* Info Content */}
        <div className="p-5 -mt-6 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">{artist.name}</h1>
              <p className="text-xs text-neon-cyan font-mono font-bold">{artist.genre}</p>
            </div>

            {/* Total Points Badge */}
            <div className="bg-neon-purple/20 border border-neon-purple/50 text-neon-yellow px-3 py-1.5 rounded-2xl font-mono text-sm font-extrabold flex items-center gap-1 shadow-neon-purple">
              <Sparkles className="w-4 h-4 fill-neon-yellow" />
              <span>{(artist.totalPoints || 0).toLocaleString()} PT</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-4 leading-relaxed whitespace-pre-line">
            {artist.bio}
          </p>

          {/* Social Links */}
          {artist.sns && (
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-dark-border">
              {artist.sns.instagram && (
                <a
                  href={`https://instagram.com/${artist.sns.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-neon-pink transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Instagram @{artist.sns.instagram}</span>
                </a>
              )}
              {artist.sns.twitter && (
                <a
                  href={`https://twitter.com/${artist.sns.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-neon-cyan transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>X / Twitter @{artist.sns.twitter}</span>
                </a>
              )}
            </div>
          )}

          {/* Action Tip Button */}
          <button
            onClick={() => onOpenTipModal(artist)}
            className="w-full mt-5 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 fill-white" />
            <span>このアーティストにポイントを送る</span>
          </button>
        </div>
      </div>

      {/* Fan Message Feed for this artist */}
      <div>
        <h3 className="text-sm font-extrabold text-white mb-3">
          {artist.name} 宛てのファンメッセージ ({artistTips.length})
        </h3>
        <RecentTipsFeed tips={artistTips} />
      </div>
    </div>
  );
}
