import React, { useState } from "react";
import { EVENT_INFO, PAST_EVENTS } from "../firebase/mockData";
import { Calendar, MapPin, Clock, Sparkles, ChevronRight, QrCode, Heart, History, Target, ArrowUpRight, Eye, Download, X } from "lucide-react";
import ArtistCard from "../components/ArtistCard";
import RecentTipsFeed from "../components/RecentTipsFeed";
import DynamicHero3D from "../components/DynamicHero3D";

export default function HomePage({ artists, tips, onOpenTipModal, onSelectArtist, setActiveTab, setActiveEventTab }) {
  const heroImageUrl = "/hero-banner.jpg";
  const officialFlyerUrl = "/promo/7th_garden_0917_flyer.jpg";
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  return (
    <div className="space-y-6 pb-6 animate-fadeIn max-w-full overflow-hidden">
      {/* 3D Interactive Hero Canvas (Three.js) */}
      <div className="w-full">
        <DynamicHero3D
          frontImage={heroImageUrl}
          backImage={officialFlyerUrl}
          onOpenModal={() => setShowFlyerModal(true)}
          entranceFee={EVENT_INFO.entranceFee}
        />
      </div>

      {/* Hero Event Details Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-neon-pink/40 shadow-2xl w-full">
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

      {/* Self-Realization & PayPay Support PR Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-red-500 to-neon-pink flex items-center justify-center text-white shadow-md">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wider flex items-center gap-1.5">
                <span>ARTIST GOALS & PAYPAY</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                  自己実現を応援
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                あなたの投げ銭がアーティストの次の創作の一歩に直結します
              </p>
            </div>
          </div>
        </div>

        {/* Featured Support Goal Cards (DJ DUNE & KASSIS) */}
        <div className="space-y-3">
          {(() => {
            const dune = artists.find((a) => a.id === "artist_dune" || a.name.toLowerCase().includes("dune"));
            const kassis = artists.find((a) => a.id === "artist_kassis" || a.name.toLowerCase().includes("kassis"));
            const featuredList = [dune, kassis].filter(Boolean);

            return featuredList.map((artist) => (
              <div
                key={artist.id}
                className="glass-panel border border-red-500/40 hover:border-red-500/70 p-4 rounded-3xl bg-gradient-to-br from-red-950/20 via-dark-card to-pink-950/20 transition-all shadow-xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onSelectArtist(artist)}
                    className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-red-500/40 cursor-pointer shadow-md group"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                        【送金先】{artist.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {artist.roleLabel}
                      </span>
                    </div>
                    <h4
                      onClick={() => onSelectArtist(artist)}
                      className="text-base font-black text-white hover:text-red-400 cursor-pointer transition-colors truncate"
                    >
                      {artist.name}
                    </h4>
                  </div>
                </div>

                {/* Goal Content Box */}
                <div className="p-3 rounded-2xl bg-dark-bg/90 border border-red-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-red-400" />
                      自己実現ゴール
                    </span>
                    {artist.supportGoal?.targetAmount && (
                      <span className="text-neon-yellow font-extrabold">
                        {artist.supportGoal.targetAmount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white leading-snug">
                    {artist.supportGoal?.title}
                  </p>
                  <p className="text-[11px] text-gray-300 leading-relaxed pt-0.5">
                    {artist.supportGoal?.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onOpenTipModal(artist, "paypay")}
                    className="flex-1 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:opacity-95 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>PayPayで【{artist.name}】を直接応援</span>
                  </button>

                  <button
                    onClick={() => onSelectArtist(artist)}
                    className="px-3 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-gray-300 hover:text-white font-mono flex items-center gap-1 transition-colors"
                  >
                    <span>詳細</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Small explainer note */}
        <p className="text-[10px] text-gray-400 font-mono text-center px-2 leading-relaxed">
          ※ PayPay送金のメッセージ（メモ）にアーティスト名を記載することで、実質的な自己実現支援金として届けられます。
        </p>
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
                  7th GARDEN 09/17 OFFICIAL POSTER
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
                alt="7th GARDEN 09/17 Official Flyer"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-dark-surface/90 border-t border-dark-border flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-gray-400">
                Compufunk Records & BAR (OSAKA)
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
