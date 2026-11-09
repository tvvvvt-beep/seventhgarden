import React from "react";
import { ArrowLeft, Sparkles, MapPin, Clock, Heart, Globe, Share2, Target } from "lucide-react";
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

          {/* Self-Realization Goal Card (自己実現プロジェクト) */}
          {artist.supportGoal && (
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-red-950/30 via-dark-surface to-pink-950/30 border border-red-500/50 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] font-bold">
                  <Target className="w-3.5 h-3.5" />
                  <span>自己実現プロジェクト（投げ銭の使い道）</span>
                </div>
                {artist.supportGoal.tag && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                    {artist.supportGoal.tag}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-black text-white leading-snug">
                {artist.supportGoal.title}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                {artist.supportGoal.description}
              </p>

              <div className="pt-2 border-t border-red-500/20 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>送金時メモ欄キーワード</span>
                <span className="font-extrabold text-neon-yellow">
                  {artist.supportGoal.memoKeyword || artist.name}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: PayPay Primary & Point Secondary */}
          <div className="space-y-2 mt-5">
            <button
              onClick={() => onOpenTipModal(artist, "paypay")}
              className="w-full bg-gradient-to-r from-red-500 via-pink-600 to-neon-purple text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
              <span>PayPayで【{artist.name}】を直接応援する（推奨）</span>
            </button>

            <button
              onClick={() => onOpenTipModal(artist, "point")}
              className="w-full bg-dark-surface hover:bg-dark-border/40 border border-dark-border text-gray-300 hover:text-white font-mono text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-neon-yellow" />
              <span>会場演出用の無料ポイント（PT）を送る</span>
            </button>
          </div>
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
