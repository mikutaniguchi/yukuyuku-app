'use client';

import React from 'react';
import { colorPalette } from '@/lib/constants';

type ColorKey = keyof typeof colorPalette;

interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  color: ColorKey;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  onClick,
  color,
  children,
  className = '',
  disabled = false,
  size = 'md',
  type = 'button',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses = `
    flex items-center justify-center gap-2 
    rounded-lg font-medium 
    transition-all duration-200 
    shadow-sm
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const colorConfig = colorPalette[color];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      style={{
        backgroundColor: colorConfig.bg,
        color: colorConfig.text,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow =
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      }}
    >
      {children}
    </button>
  );
}
