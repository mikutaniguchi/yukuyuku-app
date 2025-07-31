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
  tripDates: string[];
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
  tripDates,
  iconOptions,
}: NewScheduleModalProps) {
  const isValid = newSchedule.title.trim() !== '' && newSchedule.startTime !== '';
  
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
        tripDates={tripDates}
        iconOptions={iconOptions}
      />
      
      <div className="mt-6">
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className="w-full py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: colorPalette.abyssGreen.bg,
            color: colorPalette.abyssGreen.text 
          }}
        >
          追加
        </button>
      </div>
    </Modal>
  );
}