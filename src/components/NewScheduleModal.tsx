'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import ScheduleForm from './ScheduleForm';
import Button from './Button';
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
  const isValid =
    newSchedule.title.trim() !== '' && newSchedule.startTime !== '';

  const footerButton = (
    <Button
      onClick={onSubmit}
      disabled={!isValid}
      color="abyssGreen"
      size="md"
      className="w-full"
    >
      <Plus className="w-4 h-4" />
      追加
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="スケジュールを追加"
      icon={Plus}
      iconColor={colorPalette.abyssGreen.bg}
      maxWidth="xl"
      scrollable
      fixedFooter={footerButton}
    >
      <ScheduleForm
        schedule={newSchedule}
        onScheduleChange={onScheduleChange}
        tripMembers={tripMembers}
        tripDates={tripDates}
        iconOptions={iconOptions}
      />
    </Modal>
  );
}
