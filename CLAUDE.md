# ゆくゆく (yukuyuku-app) - プロジェクト情報

## 概要

旅行計画・管理のためのWebアプリケーション。友人や家族と旅行のスケジュール、チェックリスト、メモ、予算などを共有・管理できる。

## 重要な設定・ルール

### 開発環境

- **ポート番号**: 3003（デフォルトの3000ではない）
- **Node.js**: v22推奨（.node-versionファイルで指定）
- **パッケージマネージャー**: npm

### コーディング規約

- **コメント**: 原則コメントは追加しない（ユーザーから明示的に要求された場合のみ）
- **絵文字**: 使用しない（ユーザーから明示的に要求された場合のみ）
- **console.log**: ESLintでwarning設定。console.errorとconsole.warnのみ許可
- **TypeScript**: 厳格な型チェックを使用
- **コミットメッセージ**: シンプルな日本語で記述（例: "UIの改善とユーザビリティの向上"）

### 安全性に関するルール

- **破壊的コマンドの制限**:
  - `rm -rf` は絶対に実行しない
  - ファイル削除は必ずユーザーの確認を得る
  - `git reset --hard` や `git push --force` は避ける
  - データベースの削除操作は慎重に扱う

### テスト実行前の確認

- `npm run lint` - ESLintエラーの確認
- `npm run type-check` - TypeScriptエラーの確認
- `npm run test:e2e` - E2Eテストの実行

### Firebase関連

- **プロジェクトID**: yukuyuku-app
- **Firestore Rules デプロイ**: `firebase deploy --only firestore:rules --project yukuyuku-app`
- **認証**: Google認証とゲスト認証をサポート

### アプリケーションの仕様

#### ユーザータイプ

1. **通常ユーザー（Googleログイン）**:
   - 旅行の作成・編集・削除が可能
   - メンバー管理が可能
2. **ゲストユーザー**:
   - 招待リンク経由でのみアクセス可能
   - 閲覧のみ（編集不可）
   - ホームページへのアクセス不可
   - アカウント設定メニュー非表示

#### デフォルト設定

- 新規旅行作成時、チェックリスト「やること」が自動作成される
- デフォルトのチェックリスト項目:
  - ホテルの予約
  - 持ち物リストの作成

#### エラーページ

- `/not-found` - 404エラー
- `/error` - 500サーバーエラー
- `/access-denied` - 403アクセス拒否
- `/service-unavailable` - 503サービス停止

#### 招待リンクのエラーハンドリング

- 無効な招待コード → 404ページへリダイレクト
- ネットワーク/Firestoreエラー → 500エラーページへリダイレクト
- 権限なし → 403ページへリダイレクト

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# Lint実行
npm run lint

# E2Eテスト
npm run test:e2e

# Firestore Rules デプロイ
firebase deploy --only firestore:rules --project yukuyuku-app
```

## 注意事項

- コミット前にpre-commitフックでlint-stagedが実行される
- prettierによる自動フォーマットが適用される
- TypeScriptとESLintのエラーがあるとコミットできない
