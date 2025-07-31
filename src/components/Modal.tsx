'use client';

import React, { useEffect } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  showCloseButton?: boolean;
  children: React.ReactNode;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  icon: Icon, 
  iconColor,
  maxWidth = 'md',
  showCloseButton = true,
  children 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      // モーダルが開いたときにbodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じたときにスクロールを元に戻す
      document.body.style.overflow = 'unset';
    }

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(248, 248, 248, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-xl border border-stone-200 w-full ${maxWidthClasses[maxWidth]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon 
                className="w-6 h-6" 
                style={{ color: iconColor || colorPalette.aquaBlue.bg }} 
              />
            )}
            <h2 className="text-xl font-semibold text-stone-800">{title}</h2>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}