import React, { useState, useEffect } from "react";
import { 
  Users, Mail, Search, Sparkles, Copy, Check, 
  Send, RefreshCw 
} from "lucide-react";
import { fetchRegisteredUsers, updateUserPoints } from "../../firebase/services";

export default function UserSupportTab({ eventInfo }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedStatus, setCopiedStatus] = useState(null); // 'bcc' | 'body' | 'all' | uid
  const [pointModalUser, setPointModalUser] = useState(null);
  const [customPoints, setCustomPoints] = useState("");

  // メール作成ステート
  const [selectedTemplate, setSelectedTemplate] = useState("announce");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");

  // ユーザー一覧読み込み
  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await fetchRegisteredUsers();
      setUsers(list);
    } catch (e) {
      console.error("Failed to load registered users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // テンプレート変更時の自動本文生成
  useEffect(() => {
    const title = eventInfo?.title || "7th GARDEN";
    const date = eventInfo?.date || "2026.09.17 (THU)";
    const openTime = eventInfo?.openTime || "18:00 - 24:00";
    const venue = eventInfo?.venue || "Compufunk Records & BAR (OSAKA)";
    const entranceFee = eventInfo?.entranceFee || "Charge Free";
    const appUrl = window?.location?.origin || "https://seventhgarden.vercel.app";

    if (selectedTemplate === "announce") {
      setMailSubject(`【開催決定】${title} — PLACE FOR ART AND MUSIC @ ${venue}`);
      setMailBody(
`7th GARDEN 会員の皆様へ

いつも温かいサポートをいただき、心より感謝申し上げます。
次回「${title}」の開催が正式に決定いたしました！

【開催概要】
━━━━━━━━━━━━━━━━━━
■ 日時: ${date} ${openTime}
■ 会場: ${venue}
■ エントランス: ${entranceFee}
■ 公式Webアプリ: ${appUrl}
━━━━━━━━━━━━━━━━━━

最高峰のサウンドシステムと空間演出、アーティストたちが集う特別な一夜をお届けします。
Webアプリでは出演者の限定バイオグラフィーやタイムテーブルを随時公開中。

皆様のご来場をアーティスト・スタッフ一同、心よりお待ちしております。

7th GARDEN 運営事務局`
      );
    } else if (selectedTemplate === "timetable") {
      setMailSubject(`【タイムテーブル公開】${title} 出演者＆スケジュール決定！`);
      setMailBody(
`7th GARDEN 会員の皆様へ

${title} のタイムテーブルが確定いたしました！
トワイライトのクリスタルボウルから始まり、深夜まで濃密なセッションが展開されます。

【スケジュール・詳細はこちら】
${appUrl}

【会員特典】
Webアプリへログインいただくと、お気に入りのアーティストへのPayPay投げ銭応援や、
当日のリアルタイムFeedコメントをお楽しみいただけます。

ぜひスケジュールをチェックしてご参加ください！

7th GARDEN 運営事務局`
      );
    } else if (selectedTemplate === "reminder") {
      setMailSubject(`【ご来場案内】いよいよ開催！${title} @ ${venue}`);
      setMailBody(
`7th GARDEN 会員の皆様へ

いよいよ「${title}」の開催が迫ってまいりました！

【ご来場前にご確認ください】
・日時: ${date} ${openTime}
・会場: ${venue}
・入場: ${entranceFee}

会場内ではWebアプリを通じて、アーティストへ直接応援メッセージやPayPay投げ銭を届けることができます。
ぜひスマートフォンから以下のWebアプリを開いてフロアの熱気をご体験ください：
${appUrl}

素晴らしい夜をご一緒できることを楽しみにしております。

7th GARDEN 運営事務局`
      );
    } else if (selectedTemplate === "after") {
      setMailSubject(`【御礼】${title} ご来場ありがとうございました！`);
      setMailBody(
`7th GARDEN へご来場いただいた皆様へ

「${title}」にお越しいただき、誠にありがとうございました！
皆様と共に創り上げた素晴らしい音響空間とヴァイブスに、心より感謝申し上げます。

Webアプリのマイページにて、当日のTip履歴やアーティストからのメッセージをご確認いただけます。
次回開催の最新情報も決定次第アプリ・メールにてお届けいたします。

今後とも7th GARDENをよろしくお願いいたします。

7th GARDEN 運営事務局`
      );
    }
  }, [selectedTemplate, eventInfo]);

  // フィルタリングされたユーザー
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.memberId && u.memberId.toLowerCase().includes(q))
    );
  });

  // 有効なメールアドレスリスト
  const emailList = users
    .map((u) => u.email)
    .filter((em) => em && em.includes("@"));

  // クリップボードコピーヘルパー
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(type);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  // メーラー起動
  const handleOpenMailer = () => {
    const bcc = emailList.join(",");
    const subject = encodeURIComponent(mailSubject);
    const body = encodeURIComponent(mailBody);
    window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
  };

  // ポイント増減処理
  const handleAddPoints = async (user, delta) => {
    const newPts = (user.points || 0) + delta;
    await updateUserPoints(user.uid, newPts);
    setUsers((prev) =>
      prev.map((u) => (u.uid === user.uid ? { ...u, points: newPts } : u))
    );
  };

  // ポイント直接設定
  const handleSetCustomPoints = async () => {
    if (!pointModalUser) return;
    const pts = Number(customPoints);
    if (isNaN(pts) || pts < 0) return;
    await updateUserPoints(pointModalUser.uid, pts);
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === pointModalUser.uid ? { ...u, points: pts } : u
      )
    );
    setPointModalUser(null);
    setCustomPoints("");
  };

  return (
    <div className="space-y-6">
      {/* 告知メール配信サポートセクション */}
      <div className="glass-panel p-4 rounded-2xl border border-neon-pink/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neon-pink/15 rounded-xl text-neon-pink">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">イベント告知メール作成 & 配信</h3>
              <p className="text-[10px] text-gray-400 font-mono">
                登録ユーザーへ一括告知メール（BCC）を作成・メーラー連携
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-dark-surface border border-dark-border px-2.5 py-1 rounded-lg text-neon-pink">
            宛先: {emailList.length} 件
          </span>
        </div>

        {/* テンプレート選択 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-gray-300 font-bold block">
            配信テンプレート
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "announce", label: "① 次回開催決定案内" },
              { id: "timetable", label: "② タイムテーブル発表" },
              { id: "reminder", label: "③ 直前・当日案内" },
              { id: "after", label: "④ 来場御礼・アフター" },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                  selectedTemplate === tmpl.id
                    ? "bg-neon-pink/20 border-neon-pink text-white shadow-neon-pink"
                    : "bg-dark-surface border-dark-border text-gray-400 hover:text-white"
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* 件名入力 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-gray-300 font-bold block">
            メール件名
          </label>
          <input
            type="text"
            value={mailSubject}
            onChange={(e) => setMailSubject(e.target.value)}
            className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>

        {/* 本文入力 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono text-gray-300 font-bold">
              メール本文プレビュー / 編集
            </label>
            <span className="text-[10px] font-mono text-gray-500">
              {mailBody.length} 文字
            </span>
          </div>
          <textarea
            value={mailBody}
            onChange={(e) => setMailBody(e.target.value)}
            rows={7}
            className="w-full bg-dark-surface border border-dark-border focus:border-neon-pink/60 rounded-xl p-3 text-xs text-gray-200 outline-none transition-all resize-none font-mono text-[11px] leading-relaxed"
          />
        </div>

        {/* 送信・コピー アクション */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleOpenMailer}
            disabled={emailList.length === 0}
            className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-95 text-white font-extrabold text-xs py-3 rounded-xl shadow-neon-pink transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>メールアプリを起動（BCCに全宛先を自動入力）</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCopy(emailList.join(", "), "bcc")}
              className="bg-dark-surface hover:bg-dark-card border border-dark-border text-gray-300 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {copiedStatus === "bcc" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="text-neon-cyan">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>BCC用アドレスをコピー</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy(`【件名】\n${mailSubject}\n\n【本文】\n${mailBody}`, "body")}
              className="bg-dark-surface hover:bg-dark-card border border-dark-border text-gray-300 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {copiedStatus === "body" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="text-neon-cyan">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>件名＋本文をコピー</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 登録ユーザー一覧・サポートセクション */}
      <div className="glass-panel p-4 rounded-2xl border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neon-cyan/15 rounded-xl text-neon-cyan">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">登録ユーザー一覧 & サポート</h3>
              <p className="text-[10px] text-gray-400 font-mono">
                会員ステータス確認・ポイント付与・個別連絡
              </p>
            </div>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2 hover:bg-dark-surface rounded-xl text-gray-400 hover:text-white transition-all"
            title="最新化"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-neon-cyan" : ""}`} />
          </button>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ユーザー名、メールアドレス、会員IDで検索..."
            className="w-full bg-dark-surface border border-dark-border focus:border-neon-cyan/60 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
          />
        </div>

        {/* ユーザーサマリー統計 */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-dark-surface p-2.5 rounded-xl border border-dark-border">
            <span className="text-[9px] text-gray-400 block">総会員数</span>
            <span className="text-sm font-extrabold text-neon-cyan">{users.length} 名</span>
          </div>
          <div className="bg-dark-surface p-2.5 rounded-xl border border-dark-border">
            <span className="text-[9px] text-gray-400 block">メール保有</span>
            <span className="text-sm font-extrabold text-neon-pink">{emailList.length} 件</span>
          </div>
          <div className="bg-dark-surface p-2.5 rounded-xl border border-dark-border">
            <span className="text-[9px] text-gray-400 block">総発行ポイント</span>
            <span className="text-sm font-extrabold text-neon-yellow">
              {users.reduce((acc, u) => acc + (u.points || 0), 0)} PT
            </span>
          </div>
        </div>

        {/* ユーザーリスト */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500 font-mono">
              該当するユーザーが見つかりません
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.uid}
                className="bg-dark-surface/90 border border-dark-border hover:border-neon-cyan/40 p-3 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`}
                      alt=""
                      className="w-8 h-8 rounded-full border border-dark-border object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{u.displayName}</span>
                        {u.role && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/40">
                            {u.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neon-cyan block">
                        {u.memberId || `7TH-${u.uid.slice(0, 6).toUpperCase()}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-neon-yellow font-mono text-xs font-bold">
                      <Sparkles className="w-3 h-3 fill-neon-yellow" />
                      <span>{u.points || 0}</span>
                      <span className="text-[9px] text-gray-400">PT</span>
                    </div>
                    {u.email && (
                      <span className="text-[9px] font-mono text-gray-400 block truncate max-w-[140px]">
                        {u.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* アクションバー */}
                <div className="flex items-center justify-between pt-1 border-t border-dark-border/60 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddPoints(u, 100)}
                      className="bg-dark-card hover:bg-neon-yellow/20 hover:text-neon-yellow text-gray-300 px-2 py-1 rounded-lg border border-dark-border font-mono transition-all"
                    >
                      +100pt
                    </button>
                    <button
                      onClick={() => handleAddPoints(u, 500)}
                      className="bg-dark-card hover:bg-neon-yellow/20 hover:text-neon-yellow text-gray-300 px-2 py-1 rounded-lg border border-dark-border font-mono transition-all"
                    >
                      +500pt
                    </button>
                    <button
                      onClick={() => {
                        setPointModalUser(u);
                        setCustomPoints(String(u.points || 0));
                      }}
                      className="text-gray-400 hover:text-white underline font-mono px-1"
                    >
                      編集
                    </button>
                  </div>

                  {u.email && (
                    <a
                      href={`mailto:${u.email}?subject=${encodeURIComponent(`【7th GARDEN サポート】${u.displayName}様へのお知らせ`)}`}
                      className="text-neon-cyan hover:underline flex items-center gap-1 font-mono"
                    >
                      <Mail className="w-3 h-3" />
                      <span>個別メール</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ポイント編集モーダル */}
      {pointModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-neon-yellow/40 rounded-2xl p-5 max-w-xs w-full space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
              <span>保有ポイントの変更</span>
            </h4>
            <p className="text-xs text-gray-300">
              対象: <span className="font-bold text-white">{pointModalUser.displayName}</span>
            </p>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">新しいポイント残高</label>
              <input
                type="number"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                min="0"
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-white font-mono outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPointModalUser(null)}
                className="flex-1 py-2 rounded-xl text-xs text-gray-400 hover:bg-dark-surface"
              >
                キャンセル
              </button>
              <button
                onClick={handleSetCustomPoints}
                className="flex-1 py-2 bg-neon-yellow text-black font-extrabold rounded-xl text-xs shadow-neon-yellow"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
