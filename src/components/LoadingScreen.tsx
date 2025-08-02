'use client';

import React from 'react';
import { colorPalette } from '@/lib/constants';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = '旅行の準備中...',
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center">
      <div className="text-center">
        {/* 回転する円スピナー */}
        <div className="relative mb-8">
          <div className="relative w-20 h-20 mx-auto">
            {/* 円形に配置された小さい円 */}
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 rounded-full animate-spin-dots"
                style={{
                  backgroundColor:
                    index % 3 === 0
                      ? colorPalette.abyssGreen.light
                      : index % 3 === 1
                        ? colorPalette.roseQuartz.light
                        : colorPalette.strawBeige.light,
                  top: '50%',
                  left: '50%',
                  transformOrigin: '6px 40px',
                  transform: `rotate(${index * 45}deg) translateY(-40px)`,
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0.9 - index * 0.08,
                }}
              />
            ))}
          </div>
        </div>

        {/* メッセージ表示 */}
        <p className="text-lg text-stone-600 mt-6">{message}</p>

        {/* カスタムキーフレームアニメーション */}
        <style jsx>{`
          @keyframes spin-dots {
            0% {
              transform: rotate(0deg) translateY(-40px) scale(1);
              opacity: 1;
            }
            50% {
              transform: rotate(180deg) translateY(-40px) scale(1.2);
              opacity: 0.6;
            }
            100% {
              transform: rotate(360deg) translateY(-40px) scale(1);
              opacity: 1;
            }
          }

          .animate-spin-dots {
            animation: spin-dots 1.5s infinite ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}
