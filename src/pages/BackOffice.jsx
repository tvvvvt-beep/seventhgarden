import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getEventInfo } from "../firebase/eventConfig";
import { loadBackOffice } from "../firebase/adminStore";
import { 
  Lock, Rocket, Users, Image as ImageIcon, Share2, CalendarClock, 
  ShieldCheck 
} from "lucide-react";

import UserSupportTab from "../components/backoffice/UserSupportTab";
import PromoAssetsTab from "../components/backoffice/PromoAssetsTab";
import SnsShareTab from "../components/backoffice/SnsShareTab";
import EventManagementTab from "../components/backoffice/EventManagementTab";

// 管理者メールアドレス (バックオフィスアクセス許可リスト)
const DEFAULT_ADMIN_EMAILS = ["tvvvvt@gmail.com", "sakurai@solaris.vc"];
const ADMIN_EMAILS = (() => {
  try {
    const env = (import.meta.env && import.meta.env.VITE_ADMIN_EMAIL) || "";
    if (env) return env.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  } catch (e) { /* ignore */ }
  return DEFAULT_ADMIN_EMAILS;
})();

const isAdminEmail = (email) => ADMIN_EMAILS.includes((email || "").trim().toLowerCase());

export default function BackOffice({ onEventUpdated }) {
  const { currentUser, userProfile, signInWithGoogle } = useAuth();

  const [accessDenied, setAccessDenied] = useState(false);
  const [checking, setChecking] = useState(true);

  // 4つのタブ: 'user_support' | 'promo_assets' | 'sns_share' | 'event_management'
  const [activeTab, setActiveTab] = useState("user_support");

  // バックオフィス共有データ (告知戦略など)
  const [backOfficeData, setBackOfficeData] = useState(null);
  const [currentEventInfo, setCurrentEventInfo] = useState(getEventInfo());

  const reloadData = async () => {
    try {
      const st = await loadBackOffice();
      setBackOfficeData(st);
      setCurrentEventInfo(getEventInfo());
    } catch (err) {
      console.warn("Backoffice reload error:", err);
    }
  };

  // 初期読み込み
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const st = await loadBackOffice();
        if (cancelled) return;
        setBackOfficeData(st);
        setCurrentEventInfo(getEventInfo());
      } catch (err) {
        /* ignore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // アクセス制御
  useEffect(() => {
    if (!currentUser) {
      setAccessDenied(false);
      return;
    }
    const email = (userProfile?.email || currentUser.email || "").trim().toLowerCase();
    // 開発環境やデモログインの場合の救済判定 (uidにadminやguest_等が含まれる場合も許可)
    const isSpecialAdmin = isAdminEmail(email) || 
      currentUser.uid?.includes("admin") || 
      currentUser.displayName?.toLowerCase().includes("admin") ||
      email === "tvvvvt@gmail.com";
      
    setAccessDenied(!isSpecialAdmin);
  }, [currentUser, userProfile]);

  const handleEventUpdatedCallback = () => {
    reloadData();
    onEventUpdated && onEventUpdated();
  };

  // --- ローディング画面 ---
  if (checking) {
    return (
      <div className="space-y-6 pb-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-neon-purple" />
            <span>BACK OFFICE</span>
          </h2>
        </div>
        <div className="glass-panel rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400 font-mono">認証ステータスを確認中…</p>
        </div>
      </div>
    );
  }

  // --- 未ログイン画面 ---
  if (!currentUser) {
    return (
      <div className="space-y-6 pb-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-neon-purple" />
            <span>BACK OFFICE</span>
          </h2>
        </div>
        <div className="glass-panel rounded-3xl p-6 text-center space-y-4 border border-neon-purple/40">
          <div className="w-14 h-14 rounded-2xl bg-neon-purple/15 text-neon-purple flex items-center justify-center mx-auto shadow-neon-purple">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">運営者ログイン</h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            ユーザーサポート、宣伝用素材、SNS連携、イベント情報更新は運営アカウント専用の管理スペースです。
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:opacity-95 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-purple transition-all"
          >
            Googleアカウントでログイン
          </button>
        </div>
      </div>
    );
  }

  // --- 権限拒否画面 ---
  if (accessDenied) {
    return (
      <div className="space-y-6 pb-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <span>BACK OFFICE</span>
          </h2>
        </div>
        <div className="glass-panel rounded-3xl p-6 text-center space-y-3 border border-red-500/40">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">アクセス権限がありません</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            このエリアは運営管理者アカウント（tvvvvt@gmail.com等）専用です。
          </p>
          <div className="bg-dark-surface p-3 rounded-xl border border-dark-border inline-block">
            <p className="text-[11px] font-mono text-gray-400">ログイン中:</p>
            <p className="text-xs font-mono text-neon-pink font-bold">
              {userProfile?.email || currentUser.email || "未登録"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // タブ定義
  const TABS = [
    {
      id: "user_support",
      label: "登録ユーザー",
      sublabel: "告知メール・サポート",
      icon: Users,
      color: "from-neon-pink to-neon-purple",
      borderColor: "border-neon-pink"
    },
    {
      id: "promo_assets",
      label: "宣伝素材",
      sublabel: "フライヤー・POP・QR",
      icon: ImageIcon,
      color: "from-neon-cyan to-neon-purple",
      borderColor: "border-neon-cyan"
    },
    {
      id: "sns_share",
      label: "SNS連携",
      sublabel: "X / LINE / 告知文",
      icon: Share2,
      color: "from-neon-purple to-neon-pink",
      borderColor: "border-neon-purple"
    },
    {
      id: "event_management",
      label: "更新管理",
      sublabel: "イベント・出演者更新",
      icon: CalendarClock,
      color: "from-neon-cyan to-neon-pink",
      borderColor: "border-neon-cyan"
    },
  ];

  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* ページタイトルヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-neon-pink" />
            <span>BACK OFFICE</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-mono">
            {currentEventInfo?.title} 管理コンソール
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-neon-cyan border border-neon-cyan/50 bg-neon-cyan/10 px-2.5 py-1 rounded-xl">
            <ShieldCheck className="w-3 h-3 text-neon-cyan" />
            ADMIN
          </span>
        </div>
      </div>

      {/* 4つのカテゴリ タブナビゲーション */}
      <div className="grid grid-cols-2 gap-2 bg-dark-surface/80 p-1.5 rounded-2xl border border-dark-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 border ${
                isActive
                  ? `bg-gradient-to-r ${t.color} text-white ${t.borderColor} shadow-md`
                  : "bg-dark-card/50 border-transparent text-gray-400 hover:text-white hover:bg-dark-card"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? "bg-black/30" : "bg-dark-surface"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold block truncate leading-tight">
                  {t.label}
                </span>
                <span className="text-[9px] opacity-80 block truncate font-mono">
                  {t.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="pt-1">
        {activeTab === "user_support" && (
          <UserSupportTab 
            eventInfo={currentEventInfo} 
          />
        )}

        {activeTab === "promo_assets" && (
          <PromoAssetsTab />
        )}

        {activeTab === "sns_share" && (
          <SnsShareTab
            eventInfo={currentEventInfo}
            strategyData={backOfficeData?.strategy}
            onSaved={reloadData}
          />
        )}

        {activeTab === "event_management" && (
          <EventManagementTab
            onEventUpdated={handleEventUpdatedCallback}
          />
        )}
      </div>
    </div>
  );
}
