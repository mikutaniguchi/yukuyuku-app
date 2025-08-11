'use client';

import React from 'react';
import Button from './Button';
import { LABELS } from '@/lib/labels';

interface DeleteButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function DeleteButton({
  onClick,
  className = '',
  size = 'md',
  fullWidth = false,
  disabled = false,
}: DeleteButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="filled"
      color="sandRed"
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={disabled}
    >
      {LABELS.DELETE}
    </Button>
  );
}
