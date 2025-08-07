'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'modal' | 'compact';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white rounded-xl shadow-sm border border-stone-200',
    modal: 'bg-white rounded-xl shadow-xl border border-stone-200',
    compact: 'bg-white rounded-lg shadow-sm border border-stone-200',
  };

  const baseClasses =
    `${variantClasses[variant]} ${paddingClasses[padding]} ${className}`.trim();

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}
