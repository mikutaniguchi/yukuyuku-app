'use client';

import React from 'react';
import { colorPalette } from '@/lib/constants';
import { useTheme } from '@/contexts/ThemeContext';

type ColorKey = keyof typeof colorPalette;
type ButtonVariant = 'filled' | 'outlined' | 'ghost' | 'icon' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  color?: ColorKey;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export default function Button({
  onClick,
  color = 'abyssGreen',
  children,
  className = '',
  disabled = false,
  size = 'md',
  type = 'button',
  variant = 'filled',
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();
  const sizeClasses = {
    xs: 'p-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-base',
  };

  const getVariantStyles = () => {
    const colorConfig = colors[color];

    switch (variant) {
      case 'outlined':
        return {
          className: 'border-2 box-border bg-transparent hover:bg-stone-50',
          style: {
            borderColor: colorConfig.bg,
            color: colorConfig.bg,
            backgroundColor: 'transparent',
          },
        };
      case 'ghost':
        return {
          className: 'bg-transparent hover:bg-stone-50',
          style: { color: colorConfig.bg, backgroundColor: 'transparent' },
        };
      case 'icon':
        return {
          className: 'bg-transparent hover:bg-stone-100 shadow-none',
          style: { color: 'currentColor', backgroundColor: 'transparent' },
        };
      case 'danger':
        return {
          className: '',
          style: {
            backgroundColor: colorConfig.bg,
            color: colorConfig.text,
          },
        };
      default: // 'filled'
        return {
          className: '',
          style: {
            backgroundColor: colorConfig.bg,
            color: colorConfig.text,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const actualSize = variant === 'icon' ? 'xs' : size;

  const baseClasses = `
    flex items-center justify-center gap-2 
    rounded-lg font-medium 
    transition-all duration-200 
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variant === 'icon' ? '' : 'shadow-sm'}
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[actualSize]}
    ${variantStyles.className}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      style={variantStyles.style}
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
