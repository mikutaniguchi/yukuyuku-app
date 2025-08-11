'use client';

import React from 'react';
import Button from './Button';

interface SaveButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'save' | 'add' | 'create';
}

export default function SaveButton({
  onClick,
  className = '',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'save',
}: SaveButtonProps) {
  const getButtonText = () => {
    switch (type) {
      case 'add':
        return '追加';
      case 'create':
        return '作成';
      case 'save':
      default:
        return '保存';
    }
  };

  return (
    <Button
      onClick={onClick}
      variant="filled"
      color="abyssGreen"
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={disabled}
    >
      {getButtonText()}
    </Button>
  );
}
