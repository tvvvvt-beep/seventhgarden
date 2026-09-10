import React from "react";
import { Home, Users, MessageSquareHeart, UserCheck, Lock } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "home", label: "トップ", icon: Home },
    { id: "lineup", label: "出演者", icon: Users },
    { id: "feed", label: "Tipライブ", icon: MessageSquareHeart },
    { id: "mypage", label: "マイページ", icon: UserCheck },
    { id: "backoffice", label: "バックオフィス", icon: Lock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/90 backdrop-blur-lg border-t border-dark-border py-2 px-4 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all px-3 py-1 rounded-xl ${
                isActive
                  ? "text-neon-pink scale-105"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className={`relative p-1 rounded-lg ${isActive ? "bg-neon-pink/10" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]" : ""}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neon-pink rounded-full shadow-neon-pink animate-pulse" />
                )}
              </div>
              <span className="text-[11px] font-medium tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
