'use client';

import React from 'react';
import Button from './Button';

interface CancelButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function CancelButton({
  onClick,
  className = '',
  size = 'md',
  fullWidth = false,
}: CancelButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      color="strawBeige"
      size={size}
      fullWidth={fullWidth}
      className={className}
    >
      キャンセル
    </Button>
  );
}
