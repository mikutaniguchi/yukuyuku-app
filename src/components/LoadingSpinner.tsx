'use client';

import React from 'react';
import { colorPalette } from '@/lib/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const dotSizes = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5',
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto ${className}`}>
      {/* 円形に配置された小さい円 */}
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className={`absolute ${dotSizes[size]} rounded-full animate-spin-dots`}
          style={{
            backgroundColor:
              index % 3 === 0
                ? colorPalette.abyssGreen.bg
                : index % 3 === 1
                  ? colorPalette.roseQuartz.bg
                  : colorPalette.aquaBlue.bg,
            top: '50%',
            left: '50%',
            transformOrigin:
              size === 'small'
                ? '3px 20px'
                : size === 'medium'
                  ? '4px 28px'
                  : '5px 36px',
            transform: `rotate(${index * 45}deg) translateY(-${size === 'small' ? '20' : size === 'medium' ? '28' : '36'}px)`,
            animationDelay: `${index * 0.08}s`,
            opacity: 0.95 - index * 0.06,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes spin-dots {
          0% {
            transform: rotate(0deg)
              translateY(
                -${size === 'small' ? '20' : size === 'medium' ? '28' : '36'}px
              )
              scale(1);
            opacity: 1;
          }
          50% {
            transform: rotate(180deg)
              translateY(
                -${size === 'small' ? '20' : size === 'medium' ? '28' : '36'}px
              )
              scale(1.2);
            opacity: 0.6;
          }
          100% {
            transform: rotate(360deg)
              translateY(
                -${size === 'small' ? '20' : size === 'medium' ? '28' : '36'}px
              )
              scale(1);
            opacity: 1;
          }
        }

        .animate-spin-dots {
          animation: spin-dots 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
