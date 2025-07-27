'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';

interface CreateTripModalProps {
  onCreateTrip: (tripData: { title: string; startDate: string; endDate: string }) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export default function CreateTripModal({ onCreateTrip, onClose, isOpen }: CreateTripModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('旅行名を入力してください');
      return;
    }
    
    if (!startDate || !endDate) {
      setError('日程を選択してください');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('終了日は開始日より後の日付を選択してください');
      return;
    }
    
    onCreateTrip({
      title: title.trim(),
      startDate,
      endDate
    });
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="新しい旅行を作成"
      icon={Calendar}
      iconColor={colorPalette.aquaBlue.bg}
      showCloseButton={!!onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-2">
            旅行名
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 京都旅行"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-stone-700 mb-2">
              開始日
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-stone-700 mb-2">
              終了日
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-stone-300 rounded-lg font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: colorPalette.abyssGreen.bg }}
          >
            作成する
          </button>
        </div>
      </form>
    </Modal>
  );
}