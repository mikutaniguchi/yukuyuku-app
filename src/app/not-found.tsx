'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/buttons';
import { colorPalette } from '@/lib/constants';

export default function NotFound() {
  const colors = [
    colorPalette.abyssGreen.bg,
    colorPalette.sandRed.bg,
    colorPalette.roseQuartz.bg,
    colorPalette.aquaBlue.bg,
    colorPalette.strawBeige.bg,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* カラフルな丸がポンポン跳ねるアニメーション */}
        <div className="relative h-32 mb-8">
          <div className="flex justify-center items-end h-full gap-3">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full animate-bounce"
                style={{
                  backgroundColor: color,
                  animationDelay: `${index * 0.15}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>
        </div>

        {/* エラーメッセージ */}
        <h1 className="text-6xl font-bold text-stone-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-stone-700 mb-2">
          ページが見つかりません
        </h2>
        <p className="text-stone-600 mb-8">
          お探しのページは移動または削除された可能性があります。
          <br />
          URLをご確認いただくか、ホームへお戻りください。
        </p>

        {/* ホームへ戻るボタン */}
        <Link href="/">
          <Button
            color="abyssGreen"
            size="lg"
            className="inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホームへ戻る
          </Button>
        </Link>

        {/* その他のリンク */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link
            href="/"
            className="text-stone-500 hover:text-stone-700 transition-colors"
          >
            旅行一覧
          </Link>
          <span className="text-stone-300">|</span>
          <Link
            href="/docs"
            className="text-stone-500 hover:text-stone-700 transition-colors"
          >
            ドキュメント
          </Link>
        </div>
      </div>
    </div>
  );
}
