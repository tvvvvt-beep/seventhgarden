# AGENTS.md — Seventh Garden リポジトリ運用規約（AIエージェント必读）

このリポジトリはイベント「Seventh Garden」の運営リポジトリ兼バックオフィスです。
人間2名（tvvt_sakai / 桜井）+ AIエージェント2台（Hermes / Meta Muse）がGitHub経由で共同運用します。

## 最重要ルール（必ず守る）

1. **プロフィール・出演者情報（`src/firebase/mockData.js` の `INITIAL_ARTISTS` / `PAST_EVENTS`）の正本はgit**。
   バックオフィス画面やFirestoreへのcontent書き込みは読まれないので意味がない。編集は必ずこのリポジトリで。
2. 編集前に必ず `git pull --rebase origin main`。main への force push は禁止。
3. 1コミット1トピック。プレフィックス: `content(vol):` `feat:` `fix:` `ops:` `docs:`
4. `PAST_EVENTS` は過去アーカイブ。**削除・改変しない**（追記のみ）。
5. localStorage キーの新設・変更禁止。Firestore collections を増やさない。Firebase ルール・環境変数の変更は人間管理者のみ。
6. デプロイは push→GitHub Actions 自動（`.github/workflows/deploy.yml`）。手動 `vercel deploy` は緊急時のみ。

## アーティスト編集フォーマット（mockData.js の INITIAL_ARTISTS）

```js
{
  id: "artist-xx",            // 新規のみ: artist-yy の連番で次の番号
  name: "RISA",
  title: "VJ",                // VJ / DJ など
  bio: "…",                   // 1〜2文。テキストそのまま流用可
  x: "https://x.com/...",     // 無ければ ""
  instagram: "https://www.instagram.com/...", // 無ければ ""
  youtube: "https://www.youtube.com/@...",    // 無ければ ""
  iconUrl: "https://avatars.moe…",  // アイコン画像URL（https必須）
  role: "featured",           // 新規出演者は "featured"。次回Volで "dj" 相当へ変更
  active: true,
}
```
並び順 = 表示順（配列順）。

## エージェントの役割分担

| エージェント | 担当 |
|---|---|
| **Meta Muse**（桜井さん側） | プロフィール新規追加・更新のコミット、Vol情報の内容更新PR/コミット、tasks リポジトリへの報告 |
| **Hermes**（tvvt_sakai側） | マージ判断、本番検証（curl + bundle確認）、緊急hotfix、インフラ（Vercel/Actions/DB） |
| 人間 | 最終承認、Firebaseコンソール、会計 |

Muse が自分で push してよいのは **mockData.js と docs/ のみ**。`src/` その他・インフラファイルの変更は Hermes にコメントで依頼（tvvvvt-beep/tasks に issue）。

## Vol 運用フロー（現状の正）

1. Vol前: 出演者確定 → mockData.js 更新 → push（自動デプロイ）→ 本番 lineup 確認
2. 当日前後: **バックオフィス > イベント管理** で eventOverride（日時/会場/ステータス `on_sale`→`live`→`past`）を保存 ← ここだけFirestore運用。プロフィール編集タブは使わないこと
3. Vol後: ステータス `past`、tips は Firebase コンソールから CSV エクスポート→会計（人間作業）

## 検証ループ（push後に必ず）

```
curl -sL https://seventhgarden.vercel.app/   → 変更が反映されているか
```
反映が数分遅い場合は GitHub Actions の run 完了を確認（tvvvvt-beep/seventhgarden → Actions）。

## 詳細

- 全体像: `docs/BACKOFFICE-PLAYBOOK.md`
- 共通タスクボード: `tvvvvt-beep/tasks`（issue=タスク、コメント=報告）
