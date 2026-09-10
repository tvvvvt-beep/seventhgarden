import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function InAppBrowserBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [appName, setAppName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.userAgent) return;

    const ua = navigator.userAgent;
    let detectedApp = "";

    if (/Line/i.test(ua)) {
      detectedApp = "LINE";
    } else if (/Instagram/i.test(ua)) {
      detectedApp = "Instagram";
    } else if (/FBAN|FBAV/i.test(ua)) {
      detectedApp = "Facebook";
    } else if (/Twitter|Tweetbot/i.test(ua)) {
      detectedApp = "X (Twitter)";
    } else if (/TikTok/i.test(ua)) {
      detectedApp = "TikTok";
    }

    if (detectedApp) {
      const isDismissed = sessionStorage.getItem("dismissed_inapp_banner");
      if (!isDismissed) {
        setAppName(detectedApp);
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("dismissed_inapp_banner", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-b border-amber-400/40 px-3.5 py-2 text-xs text-amber-200">
      <div className="max-w-md mx-auto flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-white text-[11px] leading-tight">
              {appName} アプリ内ブラウザで表示中
            </p>
            <p className="text-[10px] text-gray-200 leading-relaxed">
              Googleの制限でログインできない場合があります。右上のメニューから
              <span className="text-amber-300 font-bold">「ブラウザで開く」</span>
              か、登録不要の<span className="text-neon-cyan font-bold">「ニックネーム参加」</span>をご利用ください。
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
