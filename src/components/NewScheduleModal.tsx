'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import ScheduleForm from './ScheduleForm';
import { ScheduleFormData } from '@/types';

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSchedule: ScheduleFormData;
  onScheduleChange: (schedule: ScheduleFormData) => void;
  onSubmit: () => void;
  tripMembers: Array<{ id: string; name: string }>;
  iconOptions: Array<{
    id: string;
    name: string;
    bgColor: string;
    iconColor: string;
  }>;
}

export default function NewScheduleModal({
  isOpen,
  onClose,
  newSchedule,
  onScheduleChange,
  onSubmit,
  tripMembers,
  iconOptions,
}: NewScheduleModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="スケジュールを追加"
      icon={Plus}
      iconColor={colorPalette.abyssGreen.bg}
      maxWidth="md"
    >
      <ScheduleForm
        schedule={newSchedule}
        onScheduleChange={onScheduleChange}
        tripMembers={tripMembers}
        iconOptions={iconOptions}
      />
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={onSubmit}
          className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
          style={{ 
            backgroundColor: colorPalette.abyssGreen.bg,
            color: colorPalette.abyssGreen.text 
          }}
        >
          追加
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
          style={{ 
            backgroundColor: colorPalette.sandRed.bg,
            color: colorPalette.sandRed.text 
          }}
        >
          キャンセル
        </button>
      </div>
    </Modal>
  );
}