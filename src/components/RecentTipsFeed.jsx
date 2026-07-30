import React from "react";
import { MessageSquareHeart, Sparkles, Flame } from "lucide-react";

export default function RecentTipsFeed({ tips }) {
  if (!tips || tips.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <MessageSquareHeart className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-xs text-gray-400">まだ投げ銭メッセージがありません。一番最初の応援を送りましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-neon-pink animate-bounce" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-white">LIVE FLOOR MESSAGES</h3>
        </div>
        <span className="text-[10px] font-mono text-neon-cyan animate-pulse">● REAL-TIME</span>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {tips.map((tip, idx) => (
          <div
            key={tip.id || idx}
            className="glass-panel p-3.5 rounded-2xl border border-dark-border/80 hover:border-neon-purple/40 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neon-pink to-neon-purple flex items-center justify-center text-[10px] font-extrabold text-white">
                  {tip.fromUserName ? tip.fromUserName.charAt(0) : "U"}
                </div>
                <span className="text-xs font-bold text-gray-200">{tip.fromUserName}</span>
                <span className="text-[10px] text-gray-500 font-mono">▶</span>
                <span className="text-xs font-bold text-neon-pink">{tip.toArtistName}</span>
              </div>

              <div className="flex items-center gap-1 bg-neon-purple/20 text-neon-yellow border border-neon-purple/40 px-2 py-0.5 rounded-full font-mono text-xs font-bold">
                <Sparkles className="w-3 h-3 fill-neon-yellow" />
                <span>+{tip.amount} PT</span>
              </div>
            </div>

            {tip.message && (
              <p className="text-xs text-gray-300 bg-dark-bg/50 p-2 rounded-xl border border-white/5 font-sans leading-relaxed">
                "{tip.message}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
