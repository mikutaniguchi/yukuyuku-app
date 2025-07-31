'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

interface SummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  colorKey: keyof typeof colorPalette;
  className?: string;
}

export default React.memo(function SummaryCard({
  icon: Icon,
  title,
  value,
  colorKey,
  className = '',
}: SummaryCardProps) {
  const colors = colorPalette[colorKey];
  const baseClasses = 'rounded-lg p-6 text-center';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <div className={combinedClasses} style={{ backgroundColor: colors.light }}>
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: colors.bg }} />
      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: colors.lightText }}
      >
        {title}
      </h3>
      <p className="text-2xl font-bold" style={{ color: colors.bg }}>
        {value}
      </p>
    </div>
  );
});
