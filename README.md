# ゆくゆく

## 概要
ゆくゆくは、旅行の計画・管理を簡単にするWebアプリケーションです。友人や家族と一緒に旅行のスケジュール、持ち物チェックリスト、メモ、予算などを共有・管理できます。

### 主な機能
-  **スケジュール管理** - 日程ごとの予定を時間順に管理
-  **チェックリスト** - 持ち物や準備項目をリスト化
-  **ファイル管理** - 写真やPDFなどの旅行関連ファイルを保存
-  **メモ** - 旅行に関する情報をメモとして記録
-  **予算管理** - 旅行の予算と実際の支出を管理
-  **メンバー共有** - 招待リンクで旅行メンバーと情報を共有

## 技術スタック
- **フロントエンド**: Next.js 15.4.3, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **認証**: Firebase Authentication
- **データベース**: Firebase Firestore
- **ストレージ**: Firebase Storage
- **ホスティング**: Vercel

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
`.env.local`ファイルを作成し、以下のFirebase設定を追加：
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開く
