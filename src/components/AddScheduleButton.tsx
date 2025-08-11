'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './buttons';

interface AddScheduleButtonProps {
  onClick: () => void;
  className?: string;
}

export default function AddScheduleButton({
  onClick,
  className,
}: AddScheduleButtonProps) {
  return (
    <Button
      onClick={onClick}
      color="abyssGreen"
      size="md"
      className={className}
    >
      <Plus className="w-4 h-4" />
      スケジュールを追加
    </Button>
  );
}
