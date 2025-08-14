# ゆくゆく

## 概要

ゆくゆくは、旅行の計画・管理を簡単にするWebアプリケーションです。友人や家族と一緒に旅行のスケジュール、持ち物チェックリスト、メモ、予算などを共有・管理できます。

### 主な機能

- **スケジュール管理** - 日程ごとの予定を時間順に管理
- **チェックリスト** - 持ち物や準備項目をリスト化
- **ファイル管理** - 写真やPDFなどの旅行関連ファイルを保存
- **メモ** - 旅行に関する情報をメモとして記録
- **予算管理** - 旅行の予算と実際の支出を管理
- **メンバー共有** - 招待リンクで旅行メンバーと情報を共有

## 技術スタック

- **フロントエンド**: Next.js 15.4.3, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **認証**: Firebase Authentication
- **データベース**: Firebase Firestore
- **ストレージ**: Firebase Storage
- **ホスティング**: Vercel

## ドキュメント

- [アーキテクチャドキュメント](https://yukuyuku-app.vercel.app/docs/architecture)

## 環境構築

### 必要な環境

- Node.js 18.0.0以上
- npm または yarn

### セットアップ手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/yukuyuku-app.git
cd yukuyuku-app
```

2. 依存関係をインストール

```bash
npm install
# または
yarn install
```

3. 環境変数を設定
   `.env.example`を`.env.local`にコピーして、Firebase設定を追加：

```bash
cp .env.example .env.local
```

その後、`.env.local`ファイルを編集して実際の値を設定してください。

4. 開発サーバーを起動

```bash
npm run dev
# または
yarn dev
```

5. ブラウザが自動的に [http://localhost:3003](http://localhost:3003) を開きます
   （自動で開かない場合は手動でアクセスしてください）

## テスト

### E2Eテスト

Playwrightを使用してE2Eテストを実行できます。

```bash
# 全てのE2Eテストを実行
npm run test:e2e

# UIモードで実行（視覚的なデバッグ）
npm run test:e2e:ui

# デバッグモードで実行
npm run test:e2e:debug

# 特定のプロジェクト（ブラウザ）でのみ実行
npm run test:e2e -- --project=chromium

# テストレポートを表示
npx playwright show-report
```

初回実行時は、Playwrightが必要なブラウザを自動的にダウンロードします。

テスト実行後、失敗した場合は自動的にHTMLレポートが生成され、ブラウザで開きます。
手動でレポートを確認する場合は `npx playwright show-report` を実行してください。
