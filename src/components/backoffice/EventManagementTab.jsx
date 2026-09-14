import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, Tag, Users, Plus, Trash2, 
  Save, Check, AlertCircle, RefreshCw, MoveUp, MoveDown, Edit2, ChevronDown, ChevronUp 
} from "lucide-react";
import { getEventInfo, setEventOverride } from "../../firebase/eventConfig";
import { fetchArtistsList, saveArtistsList } from "../../firebase/services";
import { saveBackOffice } from "../../firebase/adminStore";
import { INITIAL_ARTISTS } from "../../firebase/mockData";

const toDatetimeLocal = (s) => (s ? s.replace("Z", "").slice(0, 16) : "");
const fromDatetimeLocal = (s) => (s ? s.slice(0, 10) + "T00:00:00" : "");

export default function EventManagementTab({ onEventUpdated }) {
  const [eventForm, setEventForm] = useState({
    title: "",
    subtitle: "",
    date: "",
    openTime: "",
    venue: "",
    entranceFee: "",
    description: "",
  });
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState("upcoming"); // upcoming | live | ended

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState(false);
  const [expandedArtistId, setExpandedArtistId] = useState(null);

  // 初期読み込み
  const loadData = async () => {
    setLoading(true);
    try {
      const info = getEventInfo();
      setEventForm({
        title: info.title || "",
        subtitle: info.subtitle || "",
        date: info.date || "",
        openTime: info.openTime || "",
        venue: info.venue || "",
        entranceFee: info.entranceFee || "",
        description: info.description || "",
      });
      setEndsAt(info.endsAt ? toDatetimeLocal(info.endsAt) : "");
      setStatus(info.status || "upcoming");

      const artistList = await fetchArtistsList();
      setArtists(artistList);
    } catch (e) {
      console.error("Error loading event data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // イベント基本情報の保存
  const handleSaveAll = async () => {
    try {
      const patch = {
        title: eventForm.title,
        subtitle: eventForm.subtitle,
        date: eventForm.date,
        openTime: eventForm.openTime,
        venue: eventForm.venue,
        entranceFee: eventForm.entranceFee,
        description: eventForm.description,
        endsAt: endsAt ? fromDatetimeLocal(endsAt) : "",
        status: status,
      };

      setEventOverride(patch);
      await saveBackOffice({ eventOverride: patch });
      await saveArtistsList(artists);

      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
      onEventUpdated && onEventUpdated();
    } catch (e) {
      console.error("Error saving backoffice:", e);
      alert("保存中にエラーが発生しました。");
    }
  };

  // アーティスト並び替え
  const moveArtist = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= artists.length) return;
    const newArtists = [...artists];
    const temp = newArtists[index];
    newArtists[index] = newArtists[targetIndex];
    newArtists[targetIndex] = temp;
    setArtists(newArtists);
  };

  // アーティスト項目の変更
  const updateArtist = (id, field, value) => {
    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // サポートゴールの変更
  const updateSupportGoal = (id, field, value) => {
    setArtists((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const currentGoal = a.supportGoal || {};
          return {
            ...a,
            supportGoal: {
              ...currentGoal,
              [field]: value,
            },
          };
        }
        return a;
      })
    );
  };

  // 新規アーティストの追加
  const handleAddArtist = () => {
    const newId = `artist_${Date.now()}`;
    const newArtist = {
      id: newId,
      name: "NEW ARTIST",
      roleLabel: "DJ / Live",
      genre: "TECHNO",
      stage: "MAIN STAGE",
      time: "23:00 - 23:45",
      duration: "45m",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      bio: "アーティストのプロフィールをここに入力してください。",
      totalPoints: 0,
      likesCount: 0,
      sns: { instagram: "" },
    };
    setArtists([...artists, newArtist]);
    setExpandedArtistId(newId);
  };

  // アーティスト削除
  const handleDeleteArtist = (id) => {
    if (!window.confirm("この出演者を削除してもよろしいですか？")) return;
    setArtists(artists.filter((a) => a.id !== id));
  };

  // 初期データリセット
  const handleResetDefaults = async () => {
    if (!window.confirm("イベント設定と出演者一覧を初期状態に戻しますか？")) return;
    localStorage.removeItem("party_artists_custom");
    localStorage.removeItem("sg_event_info_override_v1");
    await loadData();
    onEventUpdated && onEventUpdated();
  };

  return (
    <div className="space-y-6">
      {/* イベント基本情報セクション */}
      <div className="glass-panel p-4 rounded-2xl border border-neon-cyan/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neon-cyan/15 rounded-xl text-neon-cyan">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">イベント基本情報</h3>
              <p className="text-[10px] text-gray-400 font-mono">
                タイトル・開催日時・会場・ステータスの編集
              </p>
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border outline-none ${
              status === "live"
                ? "bg-red-500/20 text-red-400 border-red-500/50"
                : status === "ended"
                ? "bg-gray-500/20 text-gray-400 border-gray-500/50"
                : "bg-green-500/20 text-green-400 border-green-500/50"
            }`}
          >
            <option value="upcoming">● 開催前 (Upcoming)</option>
            <option value="live">🔴 開催中 (Live!)</option>
            <option value="ended">✖ 終了 (Ended)</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">イベント名</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">サブタイトル</label>
              <input
                type="text"
                value={eventForm.subtitle}
                onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">開催日</label>
              <input
                type="text"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                placeholder="2026.09.17 (THU)"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">時間帯</label>
              <input
                type="text"
                value={eventForm.openTime}
                onChange={(e) => setEventForm({ ...eventForm, openTime: e.target.value })}
                placeholder="18:00 - 24:00"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">会場名</label>
              <input
                type="text"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">エントランス料金</label>
              <input
                type="text"
                value={eventForm.entranceFee}
                onChange={(e) => setEventForm({ ...eventForm, entranceFee: e.target.value })}
                placeholder="Charge Free"
                className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-400">イベント概要・説明文</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              rows={3}
              className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl p-3 text-xs text-white outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-400">
              終了日時 (自動終了チェック用)
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* アーティスト＆タイムテーブル管理セクション */}
      <div className="glass-panel p-4 rounded-2xl border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neon-pink/15 rounded-xl text-neon-pink">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">出演アーティスト＆タイムテーブル</h3>
              <p className="text-[10px] text-gray-400 font-mono">
                タイムテーブル順・プロフィール・PayPay応援ゴール設定
              </p>
            </div>
          </div>
          <button
            onClick={handleAddArtist}
            className="bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink/50 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>追加</span>
          </button>
        </div>

        {/* アーティスト一覧リスト */}
        <div className="space-y-2.5">
          {artists.map((artist, idx) => {
            const isExpanded = expandedArtistId === artist.id;

            return (
              <div
                key={artist.id}
                className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden transition-all"
              >
                {/* タイムライン概要行 */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* 上下移動ボタン */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveArtist(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-dark-card rounded text-gray-400 disabled:opacity-20"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveArtist(idx, 1)}
                        disabled={idx === artists.length - 1}
                        className="p-1 hover:bg-dark-card rounded text-gray-400 disabled:opacity-20"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>

                    <img
                      src={artist.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-dark-border"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{artist.name}</span>
                        <span className="text-[9px] font-mono text-neon-cyan px-1.5 py-0.5 rounded bg-neon-cyan/10">
                          {artist.roleLabel}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {artist.time} ({artist.duration || "45m"})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setExpandedArtistId(isExpanded ? null : artist.id)}
                      className="p-1.5 hover:bg-dark-card rounded-lg text-gray-400 hover:text-white transition-all"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neon-cyan" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteArtist(artist.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 展開時: 詳細編集フォーム */}
                {isExpanded && (
                  <div className="p-3.5 border-t border-dark-border bg-dark-card/40 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400">名前</label>
                        <input
                          type="text"
                          value={artist.name}
                          onChange={(e) => updateArtist(artist.id, "name", e.target.value)}
                          className="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400">出演時間 (time)</label>
                        <input
                          type="text"
                          value={artist.time}
                          onChange={(e) => updateArtist(artist.id, "time", e.target.value)}
                          className="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400">役割 (roleLabel)</label>
                        <input
                          type="text"
                          value={artist.roleLabel}
                          onChange={(e) => updateArtist(artist.id, "roleLabel", e.target.value)}
                          className="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400">ジャンル</label>
                        <input
                          type="text"
                          value={artist.genre}
                          onChange={(e) => updateArtist(artist.id, "genre", e.target.value)}
                          className="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400">プロフィール画像 URL</label>
                      <input
                        type="text"
                        value={artist.image}
                        onChange={(e) => updateArtist(artist.id, "image", e.target.value)}
                        className="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-white text-[11px] font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400">Bio (紹介文)</label>
                      <textarea
                        value={artist.bio}
                        onChange={(e) => updateArtist(artist.id, "bio", e.target.value)}
                        rows={2}
                        className="w-full bg-dark-surface border border-dark-border rounded-lg p-2 text-white text-[11px] leading-relaxed resize-none"
                      />
                    </div>

                    {/* PayPay投げ銭ゴール設定 */}
                    <div className="p-3 bg-neon-yellow/5 border border-neon-yellow/20 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono font-bold text-neon-yellow block">
                        PayPay投げ銭サポートゴール設定 (任意)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-gray-400">ゴールタイトル</label>
                          <input
                            type="text"
                            value={artist.supportGoal?.title || ""}
                            onChange={(e) => updateSupportGoal(artist.id, "title", e.target.value)}
                            placeholder="機材費・活動支援など"
                            className="w-full bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-[11px] text-white"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-gray-400">目標金額</label>
                          <input
                            type="text"
                            value={artist.supportGoal?.targetAmount || ""}
                            onChange={(e) => updateSupportGoal(artist.id, "targetAmount", e.target.value)}
                            placeholder="¥30,000"
                            className="w-full bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-[11px] text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-gray-400">PayPayメモ指定語句</label>
                          <input
                            type="text"
                            value={artist.supportGoal?.memoKeyword || ""}
                            onChange={(e) => updateSupportGoal(artist.id, "memoKeyword", e.target.value)}
                            placeholder="TAMAKO"
                            className="w-full bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-[11px] text-white font-mono"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-gray-400">Instagram ID</label>
                          <input
                            type="text"
                            value={artist.sns?.instagram || ""}
                            onChange={(e) => updateArtist(artist.id, "sns", { instagram: e.target.value })}
                            placeholder="username"
                            className="w-full bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-[11px] text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 一括保存 & リセットボタン */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleSaveAll}
          className="w-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-extrabold text-sm py-3.5 rounded-xl shadow-neon-pink hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          {savedStatus ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>すべての変更を保存しました</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>イベント＆出演者設定を一括保存</span>
            </>
          )}
        </button>

        <button
          onClick={handleResetDefaults}
          className="w-full bg-dark-surface hover:bg-dark-card text-gray-400 hover:text-white border border-dark-border text-xs py-2.5 rounded-xl transition-all font-mono"
        >
          初期プリセット設定にリセット
        </button>
      </div>
    </div>
  );
}
