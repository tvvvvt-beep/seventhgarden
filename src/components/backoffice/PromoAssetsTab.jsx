import React, { useState } from "react";
import { 
  FileText, ImageIcon, Download, Copy, Check, 
  Eye 
} from "lucide-react";

export default function PromoAssetsTab() {
  const [copiedId, setCopiedId] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);

  const assets = [
    {
      id: "official_flyer_0917",
      category: "image",
      title: "公式フライヤー 09/17（最新オフィシャルポスター）",
      subtitle: "Compufunk Records & BAR 全出演者掲載ポスター",
      path: "/promo/7th_garden_0917_flyer.jpg",
      format: "JPG / 縦型ポスター",
      tag: "最新公式ポスター",
      tagColor: "neon-pink",
      desc: "7th GARDEN 09/17の全出演アーティスト（山中透、Dune、tvvt、KASSIS、Sen 11、tamako、Sen & Jerry、FisH + HIWATASHI等）が網羅された最新オフィシャルフライヤー。"
    },
    {
      id: "official_photo_0917",
      category: "image",
      title: "公式フライヤー 写真アートワーク単体",
      subtitle: "切り株と林檎の象徴的メインビジュアル（文字なし写真）",
      path: "/promo/7th_garden_0917_photo_only.jpg",
      format: "JPG / 468x762",
      tag: "写真素材",
      tagColor: "neon-cyan",
      desc: "7th GARDEN 09/17のフライヤーから文字部分を除去した、切り株と林檎の写真アートワーク単体データ。SNS告知や独自デザイン素材として活用いただけます。"
    },
    {
      id: "flyer_hero",
      category: "image",
      title: "メインヒーローバナー",
      subtitle: "Webトップ・ヘッダー用横長ビジュアル",
      path: "/hero-banner.jpg",
      format: "JPG / 1200x630",
      tag: "WEB & SNS",
      tagColor: "neon-cyan",
      desc: "WebサイトのファーストビューやSNSのリンクプレビュー(OGP)に最適なメインビジュアル。"
    },
    {
      id: "flyer_poster_1",
      category: "image",
      title: "公式フライヤー（ポスターType A）",
      subtitle: "高解像度イベントキービジュアル",
      path: "/promo/ee5acd92-0ccf-416b-afe9-b3e6985808e4.jpg",
      format: "JPG / Poster",
      tag: "フライヤー",
      tagColor: "neon-pink",
      desc: "Instagramフィード投稿や印刷、告知ツイートの画像添付に最適な正方形寄りのグラフィック。"
    },
    {
      id: "flyer_poster_2",
      category: "image",
      title: "公式フライヤー（ポスターType B）",
      subtitle: "サイバー・アンビエント調グラフィック",
      path: "/promo/e386834f-4b6c-4f8a-9fca-3d8e111371fd.jpg",
      format: "JPG / Poster",
      tag: "フライヤー",
      tagColor: "neon-pink",
      desc: "アンビエント＆テクノの世界観を強調した別バリエーションの公式フライヤー。"
    },
    {
      id: "pdf_paypay_pop",
      category: "pdf",
      title: "会場卓上設置用 PayPay POP (PDF)",
      subtitle: "印刷用 A4 POPデータ (QRコード付き)",
      path: "/promo/paypay_pop.pdf",
      format: "PDF / A4印刷用",
      tag: "印刷用 PDF",
      tagColor: "neon-yellow",
      desc: "バーカウンターやDJブース、各テーブルにスタンド設置するための印刷用高画質PDF。"
    },
    {
      id: "image_paypay_pop",
      category: "image",
      title: "PayPay 投げ銭POP (画像版)",
      subtitle: "スマホ表示・SNS案内用POP画像",
      path: "/paypay-pop.png",
      format: "PNG / スクリーン用",
      tag: "会場POP",
      tagColor: "neon-yellow",
      desc: "スマートフォン画面での確認やSNSでの投げ銭方法解説に利用できる画像データ。"
    },
    {
      id: "image_paypay_qr",
      category: "image",
      title: "PayPay 送金用 QRコード",
      subtitle: "高解像度 QR単体画像",
      path: "/paypay-qr.png",
      format: "PNG",
      tag: "QRコード",
      tagColor: "neon-cyan",
      desc: "自作フライヤーや別のデザイン素材に直接組み込めるPayPay送金QRコード。"
    }
  ];

  const handleCopyLink = (path, id) => {
    const fullUrl = window.location.origin + path;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* イントロバナー */}
      <div className="glass-panel p-4 rounded-2xl border border-neon-cyan/30 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-neon-cyan/15 rounded-xl text-neon-cyan">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">公式プロモーション素材ギャラリー</h3>
            <p className="text-[10px] text-gray-400 font-mono">
              フライヤー・会場POP・QRコードのダウンロードとプレビュー
            </p>
          </div>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed pt-1">
          SNS（Instagram / X / LINE）での告知や、当日会場に設置するPOP・フライヤーとして自由にお使いいただけます。
        </p>
      </div>

      {/* アセットグリッド */}
      <div className="space-y-4">
        {assets.map((item) => {
          const isPdf = item.category === "pdf";

          return (
            <div
              key={item.id}
              className="bg-dark-surface border border-dark-border hover:border-neon-cyan/50 rounded-2xl overflow-hidden transition-all space-y-3 p-3.5"
            >
              {/* ヘッダー情報 */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        item.tagColor === "neon-pink"
                          ? "bg-neon-pink/15 text-neon-pink border-neon-pink/40"
                          : item.tagColor === "neon-purple"
                          ? "bg-neon-purple/15 text-neon-purple border-neon-purple/40"
                          : item.tagColor === "neon-yellow"
                          ? "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/40"
                          : "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40"
                      }`}
                    >
                      {item.tag}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{item.format}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">{item.subtitle}</p>
                </div>
              </div>

              {/* メディアプレビュー領域 */}
              <div className="rounded-xl overflow-hidden bg-black/40 border border-dark-border/80 flex items-center justify-center relative min-h-[160px]">
                {isPdf ? (
                  <div className="py-8 px-4 text-center space-y-2">
                    <FileText className="w-12 h-12 text-neon-yellow mx-auto opacity-80" />
                    <p className="text-xs font-mono font-bold text-white">A4 印刷用 PDF ドキュメント</p>
                    <p className="text-[10px] text-gray-400">クリックしてダウンロードまたは閲覧</p>
                  </div>
                ) : (
                  <div className="relative group w-full flex items-center justify-center bg-black/50">
                    <img
                      src={item.path}
                      alt={item.title}
                      className="max-h-52 w-auto object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
                    />
                    <button
                      onClick={() => setPreviewAsset(item)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                      <span>拡大プレビュー</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 説明 */}
              <p className="text-[11px] text-gray-300 leading-relaxed">{item.desc}</p>

              {/* アクションボタン */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={item.path}
                  download
                  className="bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 hover:from-neon-cyan/30 hover:to-neon-purple/30 text-neon-cyan border border-neon-cyan/50 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ダウンロード</span>
                </a>

                <button
                  onClick={() => handleCopyLink(item.path, item.id)}
                  className="bg-dark-card hover:bg-dark-border text-gray-300 border border-dark-border text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-neon-cyan" />
                      <span className="text-neon-cyan">URLコピー完了</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>URLをコピー</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 画像拡大モーダル */}
      {previewAsset && (
        <div 
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-lg w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-bold">{previewAsset.title}</span>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-xs font-mono text-gray-400 hover:text-white"
              >
                ✕ 閉じる
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-dark-border bg-black">
              <img
                src={previewAsset.path}
                alt={previewAsset.title}
                className="w-full h-auto max-h-[75vh] object-contain mx-auto"
              />
            </div>
            <div className="flex justify-end gap-2">
              <a
                href={previewAsset.path}
                download
                className="bg-neon-cyan text-black font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>保存する</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
