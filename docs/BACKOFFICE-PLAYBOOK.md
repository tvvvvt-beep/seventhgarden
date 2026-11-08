# Seventh Garden バックオフィス運用プレイブック

確定日: 2026-11-08 / 更新者: Hermes（tvvt_sakai 指示「理想的なバックオフィス環境を考えながら計画的に運用」）

## 0. 基本原則（決定済み）

**「静的コンテンツは git、変動データは Firestore」** の分担を単一信頼源原則として採用。
理由: Vol 運営は月1回程度でコンテンツ変更頻度が低く、git は監査履歴・巻き戻し・レビューが無料で付き、 Firestore はルール設定を誤ると全公開リスク。頻度低い編集にランタイムDBのリスクを取る利き目が薄い。

## 1. データ分担マトリクス

| データ | 信頼源 | 変更手順 | 備考 |
|---|---|---|---|
| アーティスト名/肩書き/bio/SNS/アイコン | **コード `src/firebase/mockData.js`** | Hermes/開発者にテキスト→commit→build→vercel --prod | バックオフィスUIのbio編集は**使わない**（他端末に反映されない） |
| Vol番号・日時・会場・入場料・状態( upcoming/on_sale/live/past) | **Firestore `admin/backoffice` eventOverride** | バックオフィス>イベント管理>保存 | 全端末に反映される。ここだけバックオフィス正運用 |
| totalPoints / likesCount | **Firestore `artists/*`** | 投げ銭・いいねで自動 | UIから触らない |
| tips（投げ銭フィード） | **Firestore `tips`** | ユーザー操作で自動 | 自動 |
| 出演順・並び順 | 現状 git（mockData 配列順） | コミットで変更 | Phase 1 で Firestore 化検討 |
| バックオフィス下書き | localStorage `sg_artist_draft_v1` | 自動 | 公開読み取りには絶対に使わない（2026-11-08廃止済み: 旧 `party_artists_custom`） |

## 2. 読み取りパス（現状の実装と一致）

```
fetchArtistsList() = mockData.js（内容のbase、常に）
                   + Firestore artists/*（totalPoints/likesCount のみ合成）
イベント情報       = eventConfig.js 既定 + admin/backoffice.eventOverride が上書き
```

## 3. 運用ルール（チェックリスト）

- **Vol 前（2〜3日前）**
  - [ ] mockData.js の lineup を最終確定（Hermes にプロフィールテキスト投下でOK、即デプロイ）
  - [ ] バックオフィス>イベント管理 で eventOverride を Vol 情報に更新し保存→ステータス `on_sale`→`live`
  - [ ] 本番確認: https://seventhgarden.vercel.app の lineup・カウントダウン・ステータス
- **Vol 後**
  - [ ] ステータス `past` に変更（カウントダウン・投げ銭ゲート自動停止）
  - [ ] tips を Firestore コンソールから CSV エクスポートして会計備品へ（月次で可）
- **禁止事項**
  - バックオフィスUIでの bio/名前編集 → 公開に反映されないため行わない
  - Firestore `artists/*` への手動 content 書き込み → 読まれないので紛らわしい。やらない
  - admin メール追加は `VITE_ADMIN_EMAIL` 環境変数で（コードのハードコード追加は不要）

## 4. 現状の既知リスクと対策済み内容

- ~~localStorage `party_artists_custom` が端末単位で内容を上書きし「保存したのに他端末では古い」~~
  → 2026-11-08 一般読み取りから廃止（services.js）。旧キーは reset 時に消去。
- バックオフィスの「出演者保存」は Firestore artists/* に full write するが、読まれるのは points のみ。実質無害だが誤解を招く → UI の注記追加は Phase 1。
- Auth: 公開 Firebase Auth + メール許可リストのみ。バックオフィスにポイント操作がない限り実害小。Phase 2 で App Check/ルール強化。

## 5. ロードマップ（計画的運用）

- **Phase 0（完了 2026-11-08）**: 信頼源分離を明文化、localStorage 上書きパス除去、このプレイブックをリポジトリに固定。
- **Phase 1（次のVol後）**: バックオフィスUIに「プロフィール編集はgit運用」注記＋並び順の eventOverride 化（mockData触らずに並べ替え可能に）。
- **Phase 2（運営手応え後）**: 出演者プロフィールの Firestore `profiles/*` 化を検討（条件: VJ/DJ本人が自己編集要望が出た時。その際は Firestore→git へのスナップショット同期を必ず入れる）。
- **Phase 3（収益化時）**: 投げ銭精算のため tips→BigQuery/Spreadsheet 連携、Stripe 連携の要否判断。

## 6. 権限・アクセス

- 管理者: tvvvvt@gmail.com, sakurai@solaris.vc（`src/pages/BackOffice.jsx` DEFAULT_ADMIN_EMAILS / 上書き: `VITE_ADMIN_EMAIL`）
- Firebase コンソール操作（ルール変更・エクスポート）は管理者本人のみ。エージェントには渡さない。
- デプロイ: `npx vercel deploy --prod --yes`（リポジトリ直push後。詳細は seventhgarden-app-ops スキル）
