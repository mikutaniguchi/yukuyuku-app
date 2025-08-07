'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import Button from './Button';

interface CreateTripModalProps {
  onCreateTrip: (tripData: {
    title: string;
    startDate: string;
    endDate: string;
  }) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export default function CreateTripModal({
  onCreateTrip,
  onClose,
  isOpen,
}: CreateTripModalProps) {
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
      setError('最終日は初日より後の日付を選択してください');
      return;
    }

    onCreateTrip({
      title: title.trim(),
      startDate,
      endDate,
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
        <ErrorMessage message={error} />

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-stone-700 mb-2"
          >
            旅行名
          </label>
          <FormInput
            id="title"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="例: 京都旅行"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              初日
            </label>
            <FormInput
              id="startDate"
              type="date"
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              最終日
            </label>
            <FormInput
              id="endDate"
              type="date"
              value={endDate}
              onChange={setEndDate}
              min={startDate}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {onClose && (
            <Button
              onClick={onClose}
              variant="outlined"
              color="rubyGrey"
              className="flex-1"
            >
              キャンセル
            </Button>
          )}
          <Button
            type="submit"
            disabled={!title.trim() || !startDate || !endDate}
            color="abyssGreen"
            className="flex-1"
          >
            作成する
          </Button>
        </div>
      </form>
    </Modal>
  );
}
