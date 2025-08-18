'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import { CancelButton, SaveButton } from './buttons';
import LoadingSpinner from './LoadingSpinner';

interface CreateTripModalProps {
  onCreateTrip: (tripData: {
    title: string;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
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

    setIsLoading(true);
    setError('');

    try {
      await onCreateTrip({
        title: title.trim(),
        startDate,
        endDate,
      });
    } catch {
      setError('旅行の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
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
      <div className="space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {isLoading && (
          <div className="flex flex-col items-center py-4">
            <LoadingSpinner size="medium" />
            <p className="text-stone-600 mt-2">旅行を作成しています...</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {onClose && (
            <CancelButton
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            />
          )}
          <SaveButton
            onClick={handleSubmit}
            disabled={!title.trim() || !startDate || !endDate || isLoading}
            type="create"
            className="flex-1"
          />
        </div>
      </div>
    </Modal>
  );
}
