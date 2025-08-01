'use client';

import React, { useEffect } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  showCloseButton?: boolean;
  scrollable?: boolean;
  fixedFooter?: React.ReactNode;
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
  scrollable = false,
  fixedFooter,
  children,
}: ModalProps) {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return; // 早期リターン

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(248, 248, 248, 0.7)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl border border-stone-200 w-full ${maxWidthClasses[maxWidth]} h-full flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0 shadow-sm bg-white rounded-t-xl">
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
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Fixed Footer */}
        {fixedFooter && (
          <div className="border-t border-stone-200 p-6 flex-shrink-0 bg-white rounded-b-xl shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
            {fixedFooter}
          </div>
        )}
      </div>
    </div>
  );
}
