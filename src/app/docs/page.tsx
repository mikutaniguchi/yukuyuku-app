'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
import { FileText, Database } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

// 環境変数から開発者のメールアドレスリストを取得
// const DEVELOPER_EMAILS = process.env.NEXT_PUBLIC_DEVELOPER_EMAILS
//   ? process.env.NEXT_PUBLIC_DEVELOPER_EMAILS.split(',')
//   : [];

export default function DocsPage() {
  const router = useRouter();
  // const { user, loading } = useAuth();

  // 認証チェックを一時的に無効化（面談用）
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-stone-600">読み込み中...</div>
  //     </div>
  //   );
  // }

  // if (!user || !DEVELOPER_EMAILS.includes(user.email || '')) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-stone-50">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-stone-800 mb-4">
  //           アクセス権限がありません
  //         </h1>
  //         <p className="text-stone-600 mb-4">
  //           このページは開発者のみアクセスできます
  //         </p>
  //         <button
  //           onClick={() => router.push('/')}
  //           className="px-4 py-2 rounded-lg text-white"
  //           style={{
  //             backgroundColor: colorPalette.aquaBlue.bg,
  //             color: colorPalette.aquaBlue.text,
  //           }}
  //         >
  //           ホームに戻る
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // ドキュメントセクション
  const docSections = [
    {
      title: 'アーキテクチャ',
      icon: FileText,
      description: 'システム全体の設計・認証フロー',
      link: '/docs/architecture',
    },
    {
      title: 'データベーススキーマ',
      icon: Database,
      description: 'Firestoreのコレクション構造',
      link: '/docs/database-schema',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            開発ドキュメント
          </h1>
          <p className="text-stone-600">yukuyuku-app の技術仕様とAPI設計</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section) => (
            <button
              key={section.link}
              onClick={() => router.push(section.link)}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon
                  className="w-8 h-8"
                  style={{ color: colorPalette.aquaBlue.bg }}
                />
                <h3 className="text-xl font-semibold text-stone-800">
                  {section.title}
                </h3>
              </div>
              <p className="text-stone-600">{section.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            クイックリンク
          </h2>
          <ul className="space-y-2 text-stone-600">
            <li>
              <a
                href="https://github.com/mikutaniguchi/yukuyuku-app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-800 underline"
              >
                GitHubリポジトリ
              </a>
            </li>
            <li>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-800 underline"
              >
                Firebase Console
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-800 underline"
              >
                Vercel Dashboard
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
