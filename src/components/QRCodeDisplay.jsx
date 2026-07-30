import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function QRCodeDisplay({ userProfile }) {
  const memberId = userProfile?.memberId || "7TH-GUEST-001";
  const points = userProfile?.points ?? 500;
  const qrValue = `7THGARDEN:MEMBER:${memberId}:PTS:${points}`;

  return (
    <div className="relative w-full rounded-3xl p-6 overflow-hidden glass-panel-glow border border-neon-pink/40 shadow-2xl">
      {/* Background Hologram Glow Effects */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-neon-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header Card */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-pink to-neon-purple flex items-center justify-center shadow-neon-pink">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest text-gray-300">DIGITAL VIP PASS</h4>
            <p className="text-[10px] font-mono text-neon-cyan">7TH GARDEN CLUB</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono bg-neon-pink/20 text-neon-pink border border-neon-pink/40 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          <span>VERIFIED MEMBER</span>
        </div>
      </div>

      {/* Main QR Code Section */}
      <div className="flex flex-col items-center justify-center my-4 relative z-10">
        <div className="p-3 bg-white rounded-2xl shadow-neon-cyan border-2 border-neon-cyan/80">
          <QRCodeSVG
            value={qrValue}
            size={130}
            bgColor="#FFFFFF"
            fgColor="#0A0A0F"
            level="M"
          />
        </div>
        
        {/* Member ID display */}
        <p className="mt-3 font-mono font-bold text-sm tracking-widest text-neon-cyan text-glow-cyan">
          ID: {memberId}
        </p>
      </div>

      {/* Points & User Status Footer */}
      <div className="pt-4 border-t border-dark-border/80 flex items-center justify-between relative z-10">
        <div>
          <span className="text-[10px] text-gray-400 font-mono block">CURRENT BALANCE</span>
          <div className="flex items-center gap-1.5 font-mono font-extrabold text-xl text-neon-yellow">
            <Sparkles className="w-5 h-5 fill-neon-yellow" />
            <span>{points.toLocaleString()}</span>
            <span className="text-xs text-gray-400">PT</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-mono block">MEMBER RANK</span>
          <span className="text-xs font-extrabold text-white tracking-wider bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
            GOLD PARTY GOER
          </span>
        </div>
      </div>
    </div>
  );
}
