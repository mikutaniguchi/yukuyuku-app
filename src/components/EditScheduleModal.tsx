'use client';

import React from 'react';
import { Edit2, Save, Trash2 } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import ScheduleForm from './ScheduleForm';
import ScheduleFiles from './ScheduleFiles';
import Button from './Button';
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
}: EditScheduleModalProps) {
  const isValid =
    editingScheduleData.title.trim() !== '' &&
    editingScheduleData.startTime !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="スケジュールを編集"
      icon={Edit2}
      iconColor={colorPalette.aquaBlue.bg}
      maxWidth="lg"
      scrollable
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
          />
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-stone-200">
          <Button
            onClick={onDelete}
            color="strawBeige"
            size="md"
            className="sm:w-auto"
          >
            <Trash2 className="w-4 h-4" />
            削除
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
      </div>
    </Modal>
  );
}
