'use client';

import React from 'react';
import { Edit2, Save, Trash2 } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import ScheduleForm from './ScheduleForm';
import ScheduleFiles from './ScheduleFiles';
import { Button } from './buttons';
import { Schedule, ScheduleFormData } from '@/types';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule;
  editingScheduleData: ScheduleFormData;
  onScheduleChange: (schedule: ScheduleFormData) => void;
  onSave: () => void;
  onDelete: () => void;
  tripMembers: Array<{ id: string; name: string }>;
  tripDates: string[];
  iconOptions: Array<{
    id: string;
    name: string;
    bgColor: string;
    iconColor: string;
  }>;
  // ファイル関連のprops
  onFileUpload: (scheduleId: string) => void;
  onFileDelete: (scheduleId: string, fileId: string | number) => void;
  uploadingFiles: Set<string>;
  expandedSchedules: Set<string>;
  onToggleExpand: (scheduleId: string) => void;
  onImageClick: (url: string) => void;
  onPDFClick: (url: string) => void;
  onFilesUpload?: (scheduleId: string, files: File[]) => void;
}

export default function EditScheduleModal({
  isOpen,
  onClose,
  schedule,
  editingScheduleData,
  onScheduleChange,
  onSave,
  onDelete,
  tripMembers,
  tripDates,
  iconOptions,
  onFileUpload,
  onFileDelete,
  uploadingFiles,
  expandedSchedules,
  onToggleExpand,
  onImageClick,
  onPDFClick,
  onFilesUpload,
}: EditScheduleModalProps) {
  const isValid =
    editingScheduleData.title.trim() !== '' &&
    (editingScheduleData.date === 'unscheduled' ||
      editingScheduleData.startTime !== '');

  const footerButtons = (
    <div className="flex gap-3">
      <Button
        onClick={onDelete}
        color="sandRed"
        size="md"
        className="w-12 h-12 p-0"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
      <Button
        onClick={onSave}
        disabled={!isValid}
        color="abyssGreen"
        size="md"
        className="flex-1"
      >
        <Save className="w-4 h-4" />
        保存
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="スケジュールを編集"
      icon={Edit2}
      iconColor={colorPalette.aquaBlue.bg}
      maxWidth="2xl"
      fixedFooter={footerButtons}
    >
      <div className="space-y-6">
        {/* スケジュールフォーム */}
        <ScheduleForm
          schedule={editingScheduleData}
          onScheduleChange={onScheduleChange}
          tripMembers={tripMembers}
          tripDates={tripDates}
          iconOptions={iconOptions}
        />

        {/* ファイル管理セクション */}
        <div className="border-t border-stone-200 pt-6">
          <ScheduleFiles
            files={schedule.files}
            scheduleId={schedule.id}
            onFileUpload={onFileUpload}
            onFileDelete={onFileDelete}
            uploadingFiles={uploadingFiles}
            expandedSchedules={expandedSchedules}
            onToggleExpand={onToggleExpand}
            onImageClick={onImageClick}
            onPDFClick={onPDFClick}
            onFilesUpload={onFilesUpload}
          />
        </div>
      </div>
    </Modal>
  );
}
