'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import { Trip } from '@/types';
import Button from './Button';
import CancelButton from './CancelButton';

interface DeleteTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  deleteConfirmTitle: string;
  onDeleteConfirmTitleChange: (title: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

export default function DeleteTripModal({
  isOpen,
  trip,
  deleteConfirmTitle,
  onDeleteConfirmTitleChange,
  onConfirmDelete,
  onCancel,
}: DeleteTripModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="旅行を削除"
      icon={Trash2}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-stone-700">
          この操作は取り消せません。すべてのスケジュール、メモ、チェックリストが削除されます。
        </p>
        <p className="text-stone-700">
          削除するには、旅行名「
          <span className="font-semibold">{trip?.title}</span>
          」を入力してください：
        </p>
        <input
          type="text"
          value={deleteConfirmTitle}
          onChange={(e) => onDeleteConfirmTitleChange(e.target.value)}
          placeholder="旅行名を入力"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-stone-900 bg-white"
          autoFocus
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onConfirmDelete}
          disabled={deleteConfirmTitle !== trip?.title}
          color="sandRed"
          className="flex-1"
        >
          削除
        </Button>
        <CancelButton onClick={onCancel} className="flex-1" />
      </div>
    </Modal>
  );
}
