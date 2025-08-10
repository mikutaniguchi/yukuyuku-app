'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

export default function ArchitecturePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => router.push('/docs')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          ドキュメントに戻る
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText
              className="w-8 h-8"
              style={{ color: colorPalette.aquaBlue.bg }}
            />
            <h1 className="text-3xl font-bold text-stone-800">
              アーキテクチャ
            </h1>
          </div>

          <div className="prose prose-stone max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">システム概要</h2>
            <p>
              yukuyuku-appは、Next.js
              15とFirebaseを使用したモダンな旅行管理アプリケーションです。
              PWA対応により、モバイルアプリのような体験を提供します。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">技術スタック</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-stone-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">フロントエンド</h4>
                <ul className="text-sm space-y-1">
                  <li>• Next.js 15 (App Router)</li>
                  <li>• React 18</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Lucide React Icons</li>
                  <li>• next-pwa (PWA)</li>
                </ul>
              </div>
              <div className="bg-stone-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">バックエンド・インフラ</h4>
                <ul className="text-sm space-y-1">
                  <li>• Firebase Authentication</li>
                  <li>• Firestore Database</li>
                  <li>• Vercel (デプロイ)</li>
                  <li>• GitHub Actions (CI/CD)</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">ディレクトリ構造</h2>
            <pre className="bg-stone-100 p-4 rounded-lg overflow-x-auto text-sm">{`src/
├── app/                    # Next.js App Router
│   ├── docs/              # 開発者向けドキュメント
│   ├── join/[code]/       # 旅行招待ページ
│   ├── trip/[tripId]/     # 旅行詳細ページ
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # 再利用可能コンポーネント
│   ├── Header.tsx
│   ├── LoginModal.tsx
│   ├── CreateTripModal.tsx
│   └── ...
├── contexts/              # React Context
│   └── AuthContext.tsx    # 認証状態管理
├── lib/                   # ユーティリティ・設定
│   ├── firebase.ts        # Firebase設定
│   ├── firestore.ts       # Firestore操作
│   └── constants.ts       # 定数・ヘルパー
└── types/                 # TypeScript型定義
    └── index.ts`}</pre>

            <h2 className="text-2xl font-bold mt-8 mb-4">認証フロー</h2>
            <div className="bg-stone-100 p-6 rounded-lg mb-6">
              <h4 className="font-semibold mb-4 text-stone-800">Google認証</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">ログイン画面</div>
                </div>
                <div className="text-stone-400">→</div>
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">Firebase Auth</div>
                </div>
                <div className="text-stone-400">→</div>
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">AuthContext</div>
                </div>
                <div className="text-stone-400">→</div>
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">アプリ画面</div>
                </div>
              </div>
            </div>

            <div className="bg-stone-100 p-6 rounded-lg mb-6">
              <h4 className="font-semibold mb-4 text-stone-800">ゲスト認証</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">招待URL</div>
                </div>
                <div className="text-stone-400">→</div>
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">匿名認証</div>
                </div>
                <div className="text-stone-400">→</div>
                <div className="bg-white p-3 rounded border text-center min-w-[120px]">
                  <div className="text-sm font-medium">閲覧専用</div>
                </div>
              </div>
              <p className="text-xs text-stone-600">
                ※ セッション終了時に自動削除
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">データフロー</h2>
            <div className="bg-stone-100 p-6 rounded-lg mb-4">
              <h4 className="font-semibold mb-2 text-stone-800">
                旅行管理フロー
              </h4>
              <ol className="list-decimal ml-6 space-y-1 text-sm">
                <li>ユーザーが旅行を作成（招待コード自動生成）</li>
                <li>招待URLで他のユーザーを招待</li>
                <li>メンバーがスケジュール・メモ・チェックリストを編集</li>
                <li>リアルタイムでFirestoreに変更を保存</li>
              </ol>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">認証・認可</h2>
            <div className="bg-stone-100 p-6 rounded-lg mb-6">
              <h4 className="font-semibold mb-4 text-stone-800">
                アクセス権限
              </h4>
              <ul className="list-disc ml-6 text-sm space-y-1">
                <li>読み取り: メンバーのみ（memberIds に含まれるユーザー）</li>
                <li>作成: 認証済みユーザー</li>
                <li>更新: メンバーのみ</li>
                <li>削除: 作成者のみ</li>
                <li>ゲスト: 閲覧専用（招待URL経由のみ）</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              パフォーマンス最適化
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">フロントエンド</h4>
                <ul className="text-sm space-y-1">
                  <li>• Next.js App Router（サーバーコンポーネント）</li>
                  <li>• 動的インポートによるコード分割</li>
                  <li>• PWAによるオフライン対応</li>
                  <li>• 画像最適化（next/image）</li>
                </ul>
              </div>
              <div className="bg-stone-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">バックエンド</h4>
                <ul className="text-sm space-y-1">
                  <li>• Firestoreインデックス最適化</li>
                  <li>• バッチ処理によるwrite操作効率化</li>
                  <li>• CDN配信（Vercel Edge Network）</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">デプロイメント</h2>
            <div className="bg-stone-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">CI/CD パイプライン</h4>
              <ol className="list-decimal ml-6 text-sm space-y-1">
                <li>GitHub mainブランチへのpush</li>
                <li>Vercelが自動でビルド・デプロイ</li>
                <li>プレビューデプロイメント（Pull Request時）</li>
                <li>本番環境への自動反映</li>
              </ol>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">今後の拡張予定</h2>
            <div className="bg-stone-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">機能拡張</h4>
              <ul className="list-disc ml-6 text-sm space-y-1">
                <li>しおり印刷機能</li>
                <li>PDFのオフライン対応</li>
                <li>日付未定欄設置</li>
                <li>ブックマーク機能</li>
                <li>ダークモード対応</li>
                <li>言語共通化（i18n）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
