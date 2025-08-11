'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Modal from './Modal';
import { Button, CancelButton, DeleteButton } from './buttons';
import { colorPalette } from '@/lib/constants';

interface DailyMemoModalProps {
  isOpen: boolean;
  date: string;
  currentMemo?: { text: string; nights: number };
  onSave: (text: string, nights: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function DailyMemoModal({
  isOpen,
  date,
  currentMemo,
  onSave,
  onDelete,
  onClose,
}: DailyMemoModalProps) {
  const [text, setText] = useState(currentMemo?.text || '');
  const [nights, setNights] = useState(currentMemo?.nights || 1);

  // currentMemoが変更された時に状態を更新
  useEffect(() => {
    setText(currentMemo?.text || '');
    setNights(currentMemo?.nights || 1);
  }, [currentMemo, isOpen]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim(), nights);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日（${weekday}）`;
  };

  const getEndDate = () => {
    const startDate = new Date(date);
    const endDate = new Date(
      startDate.getTime() + (nights - 1) * 24 * 60 * 60 * 1000
    );
    return endDate;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${formatDate(date)}のメモ`}
      icon={Calendar}
      iconColor={colorPalette.aquaBlue.bg}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            メモ
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例：ホテル東京駅前 チェックイン15:00"
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-stone-900 bg-white resize-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            表示期間
          </label>
          <select
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-stone-900 bg-white"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <option key={num} value={num}>
                {num}日間表示
              </option>
            ))}
          </select>
        </div>

        {nights > 1 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              {formatDate(date)}から{nights}日間、
              {getEndDate().toLocaleDateString('ja-JP', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
              まで表示されます。
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        {currentMemo && onDelete && (
          <DeleteButton onClick={handleDelete} size="md" />
        )}
        <CancelButton
          onClick={onClose}
          size="md"
          className={currentMemo && onDelete ? 'flex-1' : 'flex-1'}
        />
        <Button
          onClick={handleSave}
          disabled={!text.trim()}
          color="abyssGreen"
          size="md"
          className={currentMemo && onDelete ? 'flex-2' : 'flex-1'}
        >
          保存
        </Button>
      </div>
    </Modal>
  );
}
