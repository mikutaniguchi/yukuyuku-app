'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Database, List } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

export default function DocsPage() {
  const router = useRouter();

  // ドキュメントセクション
  const docSections = [
    {
      title: '機能一覧',
      icon: List,
      description: 'アプリの全機能の詳細説明',
      link: '/docs/features',
    },
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
          <h1 className="text-3xl font-bold text-stone-800">
            開発ドキュメント
          </h1>
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
                href="https://zenn.dev/miku/articles/b8a39e5bdf0d89"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-800 underline"
              >
                Zenn記事: 旅行計画アプリ「yukuyuku」を作った話
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
