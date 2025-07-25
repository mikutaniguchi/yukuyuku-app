'use client';

import React from 'react';
import { Trip } from '@/types';
// import { linkifyText } from '@/lib/constants';

interface MemoPageProps {
  trip: Trip;
  onTripUpdate: (tripId: number, updateFunction: (trip: Trip) => Trip) => void;
}

export default function MemoPage({ trip, onTripUpdate }: MemoPageProps) {
  const handleMemoChange = (newMemo: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      memo: newMemo
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-4">旅行メモ</h2>
      
      <div className="space-y-4">
        <textarea
          value={trip.memo}
          onChange={(e) => handleMemoChange(e.target.value)}
          placeholder="宿泊先情報、緊急連絡先、全体の注意事項など...&#10;&#10;💡 URLを入力すると自動的にリンクになります&#10;例: https://example.com/hotel"
          className="w-full h-96 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  );
}