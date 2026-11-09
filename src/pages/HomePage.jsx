import React, { useState } from "react";
import { EVENT_INFO, PAST_EVENTS } from "../firebase/mockData";
import { Calendar, MapPin, Clock, Sparkles, ChevronRight, QrCode, Heart, History, Target, ArrowUpRight, Eye, Download, X } from "lucide-react";
import ArtistCard from "../components/ArtistCard";
import RecentTipsFeed from "../components/RecentTipsFeed";
import MemorialHero from "../components/MemorialHero";

export default function HomePage({ artists, tips, onOpenTipModal, onSelectArtist, setActiveTab, setActiveEventTab }) {
  const photoOnlyUrl = "/promo/7th_garden_0917_photo_only.jpg";
  const heroImageUrl = "/hero-banner.jpg";
  const officialFlyerUrl = "/promo/7th_garden_1112_flyer.jpg";
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const isUpcomingEvent = true; // Vol.4 lineup posted — show big date headline

  return (
    <div className="space-y-6 pb-6 animate-fadeIn max-w-full overflow-hidden">
      {/* Atkins Memorial Hero — text only */}
      <div className="w-full">
        <MemorialHero
          onOpenModal={() => setShowFlyerModal(true)}
          entranceFee={EVENT_INFO.entranceFee}
          artists={artists}
        />
      </div>

      {/* Hero Event Details Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-neon-pink/40 shadow-2xl w-full">
        {/* Content Details Below Flyer Image */}
        <div className="p-5 text-center">
          <h2 className="text-2xl font-black tracking-wider text-white bg-gradient-to-r from-white via-pink-200 to-neon-pink bg-clip-text text-transparent mb-1">
            {EVENT_INFO.title}
          </h2>
          <p className="text-xs text-neon-cyan font-mono tracking-widest mb-2 font-bold">
            {EVENT_INFO.subtitle}
          </p>

          {/* Big date headline */}
          {isUpcomingEvent && (
          <div className="mb-4">
            <span className="block text-5xl sm:text-6xl font-black leading-none tracking-tight bg-gradient-to-b from-white via-pink-100 to-neon-pink bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(236,72,153,0.45)]">
              11<span className="text-neon-cyan mx-0.5">/</span>12
            </span>
            <span className="block text-sm font-mono font-bold text-gray-300 tracking-[0.3em] mt-1.5">2026 — THURSDAY</span>
          </div>
          )}

          <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed mb-5 bg-dark-card/60 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
            {EVENT_INFO.description}
          </p>

          {/* Event Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono mb-5">
            <div className="bg-dark-bg/90 backdrop-blur-md border border-dark-border p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Calendar className="w-4 h-4 text-neon-pink shrink-0" />
              <div>
                <span className="text-[9px] text-gray-500 block">DATE</span>
                <span className="text-white font-black text-base">{EVENT_INFO.date}</span>
              </div>
            </div>

            <div className="bg-dark-bg/90 backdrop-blur-md border border-dark-border p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Clock className="w-4 h-4 text-neon-cyan shrink-0" />
              <div>
                <span className="text-[9px] text-gray-500 block">TIME</span>
                <span className="text-gray-200 font-bold text-[11px]">{EVENT_INFO.openTime}</span>
              </div>
            </div>

            <div className="bg-dark-bg/90 backdrop-blur-md border border-dark-border p-3 rounded-2xl flex items-center gap-2.5 col-span-2 shadow-sm justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-neon-purple shrink-0" />
                <div>
                  <span className="text-[9px] text-gray-500 block">VENUE</span>
                  <span className="text-gray-200 font-bold text-[11px]">{EVENT_INFO.venue}</span>
                </div>
              </div>
              <span className="text-neon-yellow font-bold text-xs bg-neon-purple/20 border border-neon-purple/40 px-2.5 py-1 rounded-xl">
                {EVENT_INFO.entranceFee}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setActiveTab("lineup")}
            className="w-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-extrabold text-xs py-3.5 rounded-xl shadow-neon-pink hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>{artists.length > 0 ? "出演者一覧を見る" : "アーカイブを見る（Vol.3 / Vol.2）"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Single One-Click Event Support PayPay Banner (hidden while lineup TBD) */}
      {artists.length > 0 && (
      <div className="bg-gradient-to-r from-red-950/80 via-dark-card to-pink-950/80 border-2 border-red-500/60 p-4 rounded-3xl flex items-center justify-between gap-3 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Heart className="w-6 h-6 fill-white text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-[9px] font-mono px-2 py-0.5 bg-red-500/20 text-red-400 font-bold rounded-full border border-red-500/40">
                【送金先】イベント全体
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-yellow-500/20 text-neon-yellow font-bold rounded-full border border-yellow-500/40">
                🍸 乾杯 ¥300〜
              </span>
            </div>
            <h3 className="text-xs font-black text-white truncate">7TH GARDEN 投げ銭（PayPay）</h3>
            <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
              フロア空間・演出を直接支えるドネーションQRはこちらから！
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenTipModal(null, "paypay")}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-95 text-white font-black text-xs px-3.5 py-3 rounded-xl shadow-lg shrink-0 transition-all font-mono flex items-center gap-1.5 active:scale-95 animate-pulse"
        >
          <QrCode className="w-4 h-4" />
          <span>PayPay QR</span>
        </button>
      </div>
      )}

      {/* ARTIST GOALS & PAYPAY — 自己実現枠セクション */}
      {artists.some(a => a.supportGoal) && (() => {
        const featuredList = artists
          .filter(a => a.supportGoal)
          .sort((a, b) => {
            const nameLower = (a.name || "").toLowerCase();
            if (nameLower.includes("dune") || nameLower.includes("kassis")) return -1;
            return 1;
          });
        return (
          <div className="mt-6 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-dark-surface/80 to-dark-card border border-neon-purple/30 rounded-2xl p-4 md:p-5 shadow-lg relative group hover:border-red-500/50 transition-all">
              <div className="flex items-center justify-between flex-wrap gap-1.5 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <h2 className="text-xs md:text-sm font-black text-white font-sans">
                    アーティストの自己実現プロジェクト
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-extrabold uppercase">
                    <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                    PayPay Support Accepted
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-mono text-neon-cyan font-bold">
                  <Sparkles className="w-3 h-3 text-neon-yellow" />
                  <span>PayPayで各アーティストの目標を直接応援！</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredList.map((artist) => {
                  const goal = artist.supportGoal;
                  return (
                    <div 
                      key={`goal-${artist.id}`}
                      className="p-4 rounded-xl bg-gradient-to-br from-red-950/40 via-dark-bg to-pink-950/30 border border-red-500/30 hover:border-red-500/70 transition-all flex flex-col justify-between shadow-lg group/goal-card"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            自己実現プロジェクト
                          </span>
                          <span className="text-gray-400 truncate max-w-[110px] md:max-w-[130px]">
                            @{artist.name}
                          </span>
                        </div>

                        <h3 className="text-xs md:text-sm font-black text-white leading-snug">
                          {goal.title}
                        </h3>

                        <p className="text-[11px] md:text-xs text-gray-300 leading-relaxed line-clamp-3">
                          {goal.description}
                        </p>

                        {goal.amount && (
                          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-gray-400">
                            <span>目標金額:</span>
                            <span className="text-neon-yellow font-bold">
                              {goal.amount}
                            </span>
                          </div>
                        )}

                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <span>送金時メモ欄キーワード:</span>
                          <span className="text-white font-extrabold">
                            {goal.memoKeyword || artist.name}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-red-500/20 flex gap-2">
                        <button
                          onClick={() => onOpenTipModal(artist, "paypay")}
                          className="flex-1 bg-gradient-to-r from-red-500 via-pink-600 to-neon-purple text-white font-black text-xs py-2 rounded-lg shadow hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          <span>PayPayで応援する</span>
                        </button>

                        <button
                          onClick={() => onSelectArtist(artist)}
                          className="px-3 py-2 rounded-lg bg-dark-surface hover:bg-dark-border/40 border border-dark-border text-gray-300 text-[11px] font-mono transition-all flex items-center justify-center gap-1"
                        >
                          <span>詳細</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-dark-bg/50 border border-dark-border text-[10px] text-gray-400 font-mono leading-relaxed flex items-start gap-1.5">
                <span className="mt-0.5">💡</span>
                <span>
                  トップページの各アーティストカードおよび「出演者一覧」から、<strong className="text-white">「PayPayで応援」</strong>ボタンを押して個別に応援することができます。
                  直接PayPayアプリで送金される場合は、メモ欄に<span className="text-white font-bold">「アーティスト名キーワード（例: DJ DUNE / KASSIS）」</span>を記載いただけると、目標達成の進捗確認に大変役立ちます！
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Featured Artists Section / Coming Next placeholder */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white">{artists.length > 0 ? "PICKUP ARTISTS" : "NEXT EVENT"}</h3>
            <p className="text-[10px] text-gray-400 font-mono">{artists.length > 0 ? "今夜注目のDJ / VJ / LIVEラインナップ" : "Vol.4 — 11/12 coming next"}</p>
          </div>
          <button
            onClick={() => setActiveTab("lineup")}
            className="text-xs text-neon-cyan font-mono font-bold hover:underline flex items-center gap-0.5"
          >
            <span>すべて表示</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {(() => {
            if (artists.length === 0) {
              return (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 via-dark-card to-purple-950/40 border border-neon-pink/30 text-center space-y-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink border border-neon-pink/40 inline-block">
                    COMING NEXT
                  </span>
                  <h4 className="text-base font-black text-white tracking-wider">7th GARDEN Vol.4</h4>
                  <span className="block text-5xl font-black leading-none bg-gradient-to-b from-white to-neon-pink bg-clip-text text-transparent">11<span className="text-neon-cyan mx-0.5">/</span>12</span>
                  <p className="text-[11px] font-mono text-gray-300 tracking-[0.2em] mt-1">2026 — THURSDAY @ Compufunk Records &amp; BAR (OSAKA)</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed max-w-xs mx-auto">
                    Vol.4 のラインナップは準備中。<br />下記アーカイブからVol.3 / Vol.2 の記録を見られます。
                  </p>
                </div>
              );
            }

            const yamanaka = artists.find((a) => a.id === "artist_yamanaka" || a.name.toLowerCase().includes("yamanaka"));
            const sen11 = artists.find((a) => a.id === "artist_sen11" || (a.name.includes("Sen 11") && !a.name.includes("Jerry")));
            const displayList = [yamanaka, sen11].filter(Boolean);
            const finalList = displayList.length > 0 ? displayList : artists.slice(0, 2);

            return finalList.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onOpenTipModal={(a) => onOpenTipModal(a, "paypay")}
                onSelectArtist={onSelectArtist}
              />
            ));
          })()}
        </div>
      </div>

      {/* Past Events Archive Section */}
      <div className="bg-dark-card/60 border border-purple-900/50 p-4 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-neon-purple" />
            <h3 className="text-xs font-extrabold text-white font-mono tracking-wider">PAST EVENTS ARCHIVE</h3>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full">
            過去の開催回
          </span>
        </div>

        {PAST_EVENTS.map((event) => (
          <div
            key={event.id}
            onClick={() => {
              if (setActiveEventTab) setActiveEventTab(event.id);
              setActiveTab("lineup");
            }}
            className="p-3 bg-dark-bg/80 border border-dark-border hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {event.vol}
                </span>
                <span className="text-xs font-bold text-gray-200 group-hover:text-neon-pink transition-colors">
                  {event.title}
                </span>
              </div>
              <p className="text-[10px] font-mono text-gray-400">
                {event.date} @ {event.venue} ({(event.artists || []).length} ACTS)
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-neon-purple font-bold">
              <span>出演者を見る</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tip Feed */}
      <RecentTipsFeed tips={tips} />

      {/* Official Flyer Fullscreen Modal */}
      {showFlyerModal && (
        <div 
          onClick={() => setShowFlyerModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 cursor-zoom-out animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-md w-full max-h-[95vh] flex flex-col glass-panel rounded-3xl overflow-hidden border border-neon-pink/50 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="p-3 bg-dark-surface/90 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                <span className="text-xs font-bold text-white font-mono">
                  7th GARDEN Vol.4 (11/12) OFFICIAL POSTER
                </span>
              </div>
              <button
                onClick={() => setShowFlyerModal(false)}
                className="p-1 rounded-xl bg-dark-card text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Flyer Image Container */}
            <div className="flex-1 overflow-y-auto p-2 bg-black flex items-center justify-center">
              <img
                src={officialFlyerUrl}
                alt="7th GARDEN Vol.4 11/12 Official Poster"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-dark-surface/90 border-t border-dark-border flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-gray-400">
                Vol.4 公式ポスター (2026.11.12 THU)
              </span>
              <a
                href={officialFlyerUrl}
                download="7th_GARDEN_0917_Flyer.jpg"
                className="bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-neon-pink transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ポスター画像を保存</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
