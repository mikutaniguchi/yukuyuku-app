'use client';

import React, { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { linkifyText } from '@/lib/constants';
import LoadingSpinner from './LoadingSpinner';

interface MemoPageProps {
  trip: Trip;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
  canEdit?: boolean;
}

export default function MemoPage({
  trip,
  onTripUpdate,
  canEdit = true,
}: MemoPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);
  const handleMemoChange = (newMemo: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      memo: newMemo,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-4">メモ</h2>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="small" />
        </div>
      ) : (
        <div className="space-y-4">
          {trip.memo && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-stone-800 mb-3">
                プレビュー
              </h3>
              <div className="bg-stone-50 rounded-lg p-4 whitespace-pre-wrap break-words">
                {linkifyText(trip.memo)}
              </div>
            </div>
          )}

          {canEdit ? (
            <textarea
              value={trip.memo}
              onChange={(e) => handleMemoChange(e.target.value)}
              placeholder="宿泊先情報、緊急連絡先、全体の注意事項など...&#10;&#10;💡 URLを入力すると自動的にリンクになります&#10;例: https://example.com/hotel"
              className="w-full h-96 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none"
            />
          ) : (
            <div className="w-full h-96 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg whitespace-pre-wrap break-words overflow-y-auto">
              {trip.memo || 'メモがありません'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
