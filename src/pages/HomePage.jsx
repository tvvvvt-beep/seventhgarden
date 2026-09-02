import React from "react";
import { EVENT_INFO, PAST_EVENTS } from "../firebase/mockData";
import { Calendar, MapPin, Clock, Ticket, Sparkles, ChevronRight, QrCode, Heart, History } from "lucide-react";
import ArtistCard from "../components/ArtistCard";
import RecentTipsFeed from "../components/RecentTipsFeed";

export default function HomePage({ artists, tips, onOpenTipModal, onSelectArtist, setActiveTab, setActiveEventTab }) {
  const heroImageUrl = "/hero-banner.jpg";

  return (
    <div className="space-y-6 pb-6 animate-fadeIn max-w-full overflow-hidden">
      {/* Hero Event Flyer Card (Just-Fit Display) */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-neon-pink/50 shadow-2xl w-full">
        
        {/* Title Flyer Image */}
        <div className="relative w-full bg-black/60 flex items-center justify-center p-2">
          <img
            src={heroImageUrl}
            alt={EVENT_INFO.title}
            className="w-full h-auto max-h-72 object-contain rounded-2xl shadow-lg border border-white/10"
          />
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark-bg/80 backdrop-blur-md border border-neon-pink/60 text-neon-pink font-mono text-[10px] font-bold tracking-widest rounded-full shadow-neon-pink">
              <Sparkles className="w-3 h-3 text-neon-pink" />
              OFFICIAL FLYER
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan/60 text-neon-cyan font-mono text-[10px] font-extrabold tracking-widest rounded-full">
              {EVENT_INFO.entranceFee}
            </span>
          </div>
        </div>

        {/* Content Details Below Flyer Image */}
        <div className="p-5 text-center">
          <h2 className="text-2xl font-black tracking-wider text-white bg-gradient-to-r from-white via-pink-200 to-neon-pink bg-clip-text text-transparent mb-1">
            {EVENT_INFO.title}
          </h2>
          <p className="text-xs text-neon-cyan font-mono tracking-widest mb-3 font-bold">
            {EVENT_INFO.subtitle}
          </p>

          <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed mb-5 bg-dark-card/60 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
            {EVENT_INFO.description}
          </p>

          {/* Event Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono mb-5">
            <div className="bg-dark-bg/90 backdrop-blur-md border border-dark-border p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Calendar className="w-4 h-4 text-neon-pink shrink-0" />
              <div>
                <span className="text-[9px] text-gray-500 block">DATE</span>
                <span className="text-gray-200 font-bold text-[11px]">{EVENT_INFO.date}</span>
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
            <span>出演者一覧を見る</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Single One-Click Event Support PayPay Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-dark-card to-pink-950/70 border border-red-500/60 p-4 rounded-3xl flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Heart className="w-6 h-6 fill-white text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white">イベント投げ銭（PayPay）</span>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-mono font-bold rounded-full border border-red-500/40">
                金額自由
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
              7TH GARDEN イベント全体への応援・ドネーションをPayPayで受け付けています。
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenTipModal(null, "paypay")}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shrink-0 transition-all font-mono flex items-center gap-1.5 active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>PayPay QR</span>
        </button>
      </div>

      {/* Featured Artists Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white">PICKUP ARTISTS</h3>
            <p className="text-[10px] text-gray-400 font-mono">今夜注目のDJ / VJ / LIVEラインナップ</p>
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
            const yamanaka = artists.find((a) => a.id === "artist_yamanaka" || a.name.toLowerCase().includes("yamanaka"));
            const sen11 = artists.find((a) => a.id === "artist_sen11" || (a.name.includes("Sen 11") && !a.name.includes("Jerry")));
            const displayList = [yamanaka, sen11].filter(Boolean);
            const finalList = displayList.length > 0 ? displayList : artists.slice(0, 2);

            return finalList.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onOpenTipModal={(a) => onOpenTipModal(a, "point")}
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
                {event.date} @ {event.venue} (10 ACTS)
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
    </div>
  );
}
