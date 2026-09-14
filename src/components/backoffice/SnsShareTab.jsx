import React, { useState, useEffect } from "react";
import { 
  Share2, Copy, Check, ExternalLink, 
  Hash, Save
} from "lucide-react";
import { saveBackOffice } from "../../firebase/adminStore";

export default function SnsShareTab({ eventInfo, strategyData, onSaved }) {
  const [hashtags, setHashtags] = useState(
    strategyData?.hashtags || "#7thGarden #CompuFunk #PlaceForArtAndMusic #OsakaTechno #AmbientMusic"
  );
  const [postText, setPostText] = useState(strategyData?.copyText || "");
  const [selectedTemplate, setSelectedTemplate] = useState("announce");
  const [copiedType, setCopiedType] = useState(null); // 'post' | 'tag' | 'all'
  const [saveStatus, setSaveStatus] = useState("idle");

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://seventhgarden.vercel.app";

  // テンプレート変更時の自動文面生成
  useEffect(() => {
    if (postText && selectedTemplate === "custom") return;

    const title = eventInfo?.title || "7th GARDEN 09/17";
    const date = eventInfo?.date || "2026.09.17 (THU)";
    const openTime = eventInfo?.openTime || "18:00 - 24:00";
    const venue = eventInfo?.venue || "Compufunk Records & BAR (OSAKA)";
    const entranceFee = eventInfo?.entranceFee || "Charge Free";

    if (selectedTemplate === "announce") {
      setPostText(
`【開催決定】${title}
PLACE FOR ART AND MUSIC

2026.09.17 (THU) 18:00 - 24:00
@ Compufunk Records & BAR (OSAKA)
Entrance: ${entranceFee}

アンビエントからテクノ、ポエトリーまで。
誰もが等価にただ佇むことができる「庭」へようこそ。

詳細・出演者情報はこちら▼
${appUrl}
${hashtags}`
      );
    } else if (selectedTemplate === "lineup") {
      setPostText(
`【TIMETABLE & LINEUP】
${title} @ ${venue}

18:00 tamako (Crystal Bowl)
18:15 Selector: Sen 11
19:00 Dune (U.V.)
19:45 Sen & Jerry (Live P.A.)
20:15 youngANDoldNEVERdie
20:55 toru yamanaka (Dumb Type)
21:55 KASSIS
22:45 tvvt (Closing)

Webアプリで出演者バイオ公開中▼
${appUrl}
${hashtags}`
      );
    } else if (selectedTemplate === "today") {
      setPostText(
`【本日開催！】${title}
今夜18:00 OPEN / 入場無料

大阪・北浜のCompufunk Recordsにて開催！
トワイライトのサウンドヒーリングから夜のテクノセッションまで。
会場内WebアプリからPayPay投げ銭でアーティスト応援も可能です！

詳細はこちら▼
${appUrl}
${hashtags}`
      );
    } else if (selectedTemplate === "after") {
      setPostText(
`【THANKS!】
${title} にお越しいただいた皆様、本当にありがとうございました！

素晴らしい音響空間と皆様のサポートに感謝いたします。
マイページからTip履歴もご確認いただけます▼
${appUrl}

また次回の「庭」でお会いしましょう。
${hashtags}`
      );
    }
  }, [selectedTemplate, eventInfo, hashtags]);

  // X (Twitter) シェア用URL生成
  const getXShareUrl = () => {
    const textWithoutUrl = postText.replace(appUrl, "").trim();
    const encodedText = encodeURIComponent(textWithoutUrl);
    const encodedUrl = encodeURIComponent(appUrl);
    return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  };

  // LINE シェア用URL
  const getLineShareUrl = () => {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(postText)}`;
  };

  // コピー処理
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // 保存処理
  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await saveBackOffice({
        strategy: {
          hashtags,
          copyText: postText,
          updatedAt: Date.now()
        }
      });
      setSaveStatus("saved");
      onSaved && onSaved();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // 文字数カウント (Xは全角1文字=2カウント、半角=1カウント、URL=23カウント概算)
  const charCount = postText.length;
  const isOverLimit = charCount > 280;

  return (
    <div className="space-y-6">
      {/* 告知文ジェネレーター */}
      <div className="glass-panel p-4 rounded-2xl border border-neon-purple/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neon-purple/15 rounded-xl text-neon-purple">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">SNS告知文ジェネレーター</h3>
              <p className="text-[10px] text-gray-400 font-mono">
                X / LINE / Instagram / Threads用フォーマット作成
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-dark-surface border border-dark-border px-2.5 py-1 rounded-lg text-neon-purple">
            {charCount} 文字
          </span>
        </div>

        {/* テンプレートセレクター */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-gray-300 font-bold block">
            告知プリセット
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "announce", label: "① イベント開催決定" },
              { id: "lineup", label: "② タイムテーブル＆出演者" },
              { id: "today", label: "③ 当日直前リマインド" },
              { id: "after", label: "④ アフター＆お礼" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTemplate(item.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                  selectedTemplate === item.id
                    ? "bg-neon-purple/20 border-neon-purple text-white shadow-neon-purple"
                    : "bg-dark-surface border-dark-border text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ハッシュタグ設定 */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-gray-300 font-bold flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-neon-cyan" />
            <span>自動挿入ハッシュタグ</span>
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="w-full bg-dark-surface border border-dark-border focus:border-neon-purple/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
            placeholder="#7thGarden #CompuFunk"
          />
        </div>

        {/* 投稿文入力 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono text-gray-300 font-bold">
              投稿文プレビュー / 編集
            </label>
            {isOverLimit && (
              <span className="text-[10px] font-mono text-red-400 font-bold">
                ※ X(旧Twitter)の通常文字数(140字/半角280字)を超過しています
              </span>
            )}
          </div>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={8}
            className="w-full bg-dark-surface border border-dark-border focus:border-neon-purple/60 rounded-xl p-3 text-xs text-gray-100 outline-none transition-all resize-none font-mono text-[11px] leading-relaxed"
          />
        </div>

        {/* 保存ボタン */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex-1 bg-dark-surface hover:bg-dark-card border border-dark-border text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-gray-300 hover:text-white transition-all"
          >
            {saveStatus === "saved" ? (
              <>
                <Check className="w-4 h-4 text-neon-cyan" />
                <span className="text-neon-cyan">保存完了</span>
              </>
            ) : saveStatus === "saving" ? (
              <span>保存中...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>下書きをクラウド/端末に保存</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy(postText, "post")}
            className="bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/60 text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            {copiedType === "post" ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="text-white">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>全文コピー</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 各SNSワンクリック連携セクション */}
      <div className="glass-panel p-4 rounded-2xl border border-dark-border space-y-4">
        <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-neon-pink" />
          <span>ワンクリックSNS連携 & シェア</span>
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {/* X (Twitter) */}
          <div className="bg-dark-surface p-3.5 rounded-xl border border-dark-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-gray-700 flex items-center justify-center font-bold text-white text-base">
                𝕏
              </div>
              <div>
                <span className="text-xs font-bold text-white block">X (Twitter)</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  ワンクリックで投稿画面を立ち上げ
                </span>
              </div>
            </div>
            <a
              href={getXShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-100 text-black font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <span>𝕏でポスト</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* LINE */}
          <div className="bg-dark-surface p-3.5 rounded-xl border border-dark-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#06C755] flex items-center justify-center font-bold text-white text-base shadow-sm">
                💬
              </div>
              <div>
                <span className="text-xs font-bold text-white block">LINE (公式 / グループ)</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  トークやオープンチャットへ共有
                </span>
              </div>
            </div>
            <a
              href={getLineShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#06C755] hover:bg-[#05b34c] text-white font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
            >
              <span>LINE共有</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram */}
          <div className="bg-dark-surface p-3.5 rounded-xl border border-dark-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center font-bold text-white text-base">
                ◎
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Instagram (Stories / Feed)</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  キャプションコピー＆動画/画像素材の利用
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopy(postText, "insta")}
              className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
            >
              {copiedType === "insta" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>本文コピー</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
