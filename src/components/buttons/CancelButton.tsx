'use client';

import React from 'react';
import Button from './Button';

interface CancelButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function CancelButton({
  onClick,
  className = '',
  size = 'md',
  fullWidth = false,
  disabled = false,
}: CancelButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="filled"
      color="strawBeige"
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      className={className}
    >
      キャンセル
    </Button>
  );
}
