'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import { Trip } from '@/types';

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
      iconColor="#DC2626"
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-stone-700">
          この操作は取り消せません。すべてのスケジュール、メモ、チェックリストが削除されます。
        </p>
        <p className="text-stone-700">
          削除するには、旅行名「
          <span className="font-semibold text-stone-900">{trip?.title}</span>
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
        <button
          onClick={onConfirmDelete}
          disabled={deleteConfirmTitle !== trip?.title}
          className={`flex-1 py-2 text-white rounded-lg transition-colors font-medium ${
            deleteConfirmTitle === trip?.title
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          削除
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
          style={{
            backgroundColor: colorPalette.strawBeige.bg,
            color: colorPalette.strawBeige.text,
          }}
        >
          キャンセル
        </button>
      </div>
    </Modal>
  );
}
