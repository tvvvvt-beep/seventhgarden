import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getEventInfo, setEventOverride } from "../firebase/eventConfig";
import { loadBackOffice, saveBackOffice } from "../firebase/adminStore";
import { Lock, Rocket, Megaphone, CalendarClock, Check, X, Save, Info } from "lucide-react";

const CHANNELS = [
  { id: "line", label: "LINE", icon: "💬" },
  { id: "x", label: "X (Twitter)", icon: "𝕏" },
  { id: "instagram", label: "Instagram", icon: "◎" },
  { id: "discord", label: "Discord", icon: "🎮" },
];

const toDatetimeLocal = (s) => (s ? s.replace("Z", "").slice(0, 16) : "");
const fromDatetimeLocal = (s) => (s ? s.slice(0, 10) + "T00:00:00" : "");

// 管理者メールアドレス (バックオフィスアクセス許可リスト)。
// .env の VITE_ADMIN_EMAIL にカンマ区切りで上書き可能。
const DEFAULT_ADMIN_EMAILS = ["tvvvvt@gmail.com"];
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
  const [tab, setTab] = useState("strategy");

  // 告知戦略
  const [channels, setChannels] = useState([]);
  const [hashtags, setHashtags] = useState("");
  const [copyText, setCopyText] = useState("");
  const [copied, setCopied] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  // イベント管理
  const [eventForm, setEventForm] = useState({ title: "", subtitle: "", date: "", openTime: "", venue: "", description: "", entranceFee: "" });
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState("upcoming"); // upcoming | ended
  const [eventSaved, setEventSaved] = useState(false);
  const [autoChecked, setAutoChecked] = useState(false);

  // 初期読み込み (1回だけ)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const st = await loadBackOffice();
        if (cancelled) return;
        const s = st?.strategy || {};
        setChannels(s.channels || CHANNELS.map(c => c.id));
        setHashtags(s.hashtags || "");
        setCopyText(s.copyText || "");
        const e = st?.eventOverride || {};
        setEventForm({
          title: e.title || "", subtitle: e.subtitle || "", date: e.date || "",
          openTime: e.openTime || "", venue: e.venue || "", description: e.description || "",
          entranceFee: e.entranceFee || ""
        });
        setEndsAt(e.endsAt ? toDatetimeLocal(e.endsAt) : "");
        setStatus(e.status === "ended" ? "ended" : "upcoming");
      } catch (err) {
        /* localStorage不可等 — デフォルト表示で問題なし */
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // 終了チェック: 終了日時を過ぎた (かつ次回イベント日付が来ない) 間は「更新待ち」表示。
  // 次回イベントの日付が来たら自動で「更新済み」扱いにして終了する。
  useEffect(() => {
    const info = getEventInfo();
    if (!info.endsAt) { setAutoChecked(false); return; }
    const end = Date.parse(info.endsAt);
    if (!Number.isFinite(end)) { setAutoChecked(false); return; }
    // 次回イベント日付 (イベント日) を取得
    const nextDate = info.nextEventDate || (info.date ? Date.parse(info.date + " 00:00:00") : NaN);
    const set = (v) => setAutoChecked(v);
    let timer = null;
    const check = () => {
      const now = Date.now();
      if (now < end) { set(false); return; }
      if (Number.isFinite(nextDate) && now < nextDate) { set(true); return; }
      // 次回イベント日付が来たら → 自動更新済み、チェック停止
      set(true);
      if (timer) { clearInterval(timer); timer = null; }
    };
    check();
    timer = setInterval(check, 30000);
    return () => { if (timer) clearInterval(timer); };
  }, [status, endsAt]);

  // アクセス制御: 管理者メールアドレスで判定
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) { setAccessDenied(false); return; }
      const email = (userProfile?.email || currentUser.email || "").trim().toLowerCase();
      if (!isAdminEmail(email)) setAccessDenied(true);
    };
    checkAccess();
  }, [currentUser, userProfile]);

  // 終了 → 自動更新のトリガー (次回イベントが来たら「更新済み」マーク)
  const markEventEnded = () => {
    const info = getEventInfo();
    const patch = {
      status: "ended",
      title: eventForm.title || info.title,
      subtitle: eventForm.subtitle || info.subtitle,
      date: eventForm.date || info.date,
      openTime: eventForm.openTime || info.openTime,
      venue: eventForm.venue || info.venue,
      description: eventForm.description || info.description,
      entranceFee: eventForm.entranceFee || info.entranceFee,
      endsAt: endsAt ? fromDatetimeLocal(endsAt) : info.endsAt
    };
    setEventOverride(patch);
    saveBackOffice({ eventOverride: patch });
    onEventUpdated && onEventUpdated();
  };

  const saveStrategy = async () => {
    setSaveState("saving");
    const strategy = { channels, hashtags, copyText };
    try {
      await saveBackOffice({ strategy });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const saveEvent = async () => {
    const info = getEventInfo();
    const patch = {
      status: status,
      title: eventForm.title || info.title,
      subtitle: eventForm.subtitle || info.subtitle,
      date: eventForm.date || info.date,
      openTime: eventForm.openTime || info.openTime,
      venue: eventForm.venue || info.venue,
      description: eventForm.description || info.description,
      entranceFee: eventForm.entranceFee || info.entranceFee,
      endsAt: endsAt ? fromDatetimeLocal(endsAt) : info.endsAt
    };
    setEventOverride(patch);
    await saveBackOffice({ eventOverride: patch });
    setEventSaved(true);
    setTimeout(() => setEventSaved(false), 2000);
    onEventUpdated && onEventUpdated();
  };

  // --- アクセス拒否 ---
  if (checking) {
    return (
      <div className="space-y-6 pb-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-neon-purple" />
            <span>BACK OFFICE</span>
          </h2>
        </div>
        <div className="glass-panel rounded-2xl p-6 text-center">
          <p className="text-xs text-gray-400 font-mono">読み込み中…</p>
        </div>
      </div>
    );
  }

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
          <Lock className="w-10 h-10 text-neon-purple mx-auto" />
          <h3 className="text-base font-extrabold text-white">管理者ログイン</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            告知戦略の共有・イベントの自動更新は、運営アカウントに限り利用できます。
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

  if (accessDenied) {
    return (
      <div className="space-y-6 pb-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-neon-purple" />
            <span>BACK OFFICE</span>
          </h2>
        </div>
        <div className="glass-panel rounded-3xl p-6 text-center space-y-3 border border-red-500/40">
          <Lock className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-extrabold text-white">権限がありません</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            このエリアは運営アカウント専用です。
          </p>
          <p className="text-[11px] font-mono text-gray-500">{userProfile?.email || ""}</p>
        </div>
      </div>
    );
  }

  // --- 管理者ビュー ---
  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-neon-pink" />
            <span>BACK OFFICE</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono">告知戦略・イベント更新</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-neon-cyan border border-neon-cyan/50 bg-neon-cyan/10 px-2.5 py-1 rounded-xl">
          <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
          ADMIN
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-dark-surface rounded-2xl border border-dark-border">
        <button
          onClick={() => setTab("strategy")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
            tab === "strategy"
              ? "bg-gradient-to-r from-neon-pink/80 to-neon-purple/80 text-white shadow-neon-pink"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>告知戦略</span>
        </button>
        <button
          onClick={() => setTab("event")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
            tab === "event"
              ? "bg-gradient-to-r from-neon-cyan/80 to-neon-purple/80 text-white shadow-neon-cyan"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>イベント更新</span>
        </button>
      </div>

      {/* Tab: 告知戦略 */}
      {tab === "strategy" && (
        <div className="space-y-4">
          {/* 共有ステータス */}
          <div className="bg-dark-card/60 border border-dark-border p-3.5 rounded-2xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-300 leading-relaxed">
              ここに保存した戦略は、<span className="text-neon-cyan font-bold">ログイン済みの端末</span>で共有表示されます。
              保存は端末のローカルに反映され、可能ならクラウド同期されます。
            </p>
          </div>

          {/* チャンネル選択 */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white">告知チャンネル</h3>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((c) => {
                const active = channels.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (active) setChannels(channels.filter(id => id !== c.id));
                      else setChannels([...channels, c.id]);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      active
                        ? "bg-neon-pink/15 border-neon-pink/60 text-white"
                        : "bg-dark-surface border-dark-border text-gray-400"
                    }`}
                  >
                    <span>{c.icon} {c.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-neon-pink" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ハッシュタグ */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white">ハッシュタグ</h3>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#7thGarden #CompuFunk #PlaceForArtAndMusic"
              className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
            />
          </div>

          {/* コピー用投稿文 */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white">投稿文 (コピーして各SNSへ)</h3>
            <textarea
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              rows={5}
              placeholder={"7th GARDEN 09/17\nPLACE FOR ART AND MUSIC\n\n2026.09.17 (THU) 18:00 - 24:00\nCompufunk Records & BAR (OSAKA)\n\n#7thGarden #CompuFunk #PlaceForArtAndMusic"}
              className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all resize-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(copyText || hashtags);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/60 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5" /><span>コピー済み</span></>
              ) : (
                <span>コピー</span>
              )}
            </button>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={saveStrategy}
            disabled={saveState === "saving"}
            className="w-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saveState === "saved" ? (
              <><Check className="w-4 h-4" /><span>保存完了</span></>
            ) : saveState === "saving" ? (
              <><span>保存中…</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>告知戦略を保存</span></>
            )}
          </button>
        </div>
      )}

      {/* Tab: イベント更新 */}
      {tab === "event" && (
        <div className="space-y-4">
          {/* 自動更新ステータス */}
          {autoChecked && (
            <div className="bg-green-500/10 border border-green-500/50 p-3.5 rounded-2xl flex items-center gap-2.5">
              <Check className="w-4 h-4 text-green-400" />
              <p className="text-[11px] text-green-300 font-bold">
                次回イベント日付を確認済み — イベント情報は最新状態です。
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white">イベント情報編集</h3>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 block">タイトル</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="7th GARDEN 10/24"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 block">日付</label>
              <input
                type="text"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                placeholder="2026.10.24 (FRI)"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 block">時間</label>
              <input
                type="text"
                value={eventForm.openTime}
                onChange={(e) => setEventForm({ ...eventForm, openTime: e.target.value })}
                placeholder="18:00 - 24:00"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 block">会場</label>
              <input
                type="text"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                placeholder="Compufunk Records & BAR (OSAKA)"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-400 block">
                終了日時 (自動更新チェック用)
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveEvent}
                className="flex-1 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-extrabold text-sm py-3 rounded-xl shadow-neon-pink hover:opacity-95 transition-all"
              >
                {eventSaved ? "✓ 保存済み" : "イベント情報を保存"}
              </button>
              <button
                onClick={markEventEnded}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/60 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>終了とマーク</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
