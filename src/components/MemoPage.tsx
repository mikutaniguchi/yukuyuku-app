'use client';

import React, { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { formatMarkdownText } from '@/lib/constants';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const value = textarea.value;

      // カーソル位置の行を取得
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];

      // 箇条書きの場合
      if (currentLine.match(/^-\s+(.*)$/)) {
        e.preventDefault();
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(start);
        const newValue = beforeCursor + '\n- ' + afterCursor;
        handleMemoChange(newValue);

        // カーソル位置を設定
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 3;
        }, 0);
      }

      // 番号付きリストの場合
      const numberedMatch = currentLine.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        e.preventDefault();
        const currentNumber = parseInt(numberedMatch[1]);
        const nextNumber = currentNumber + 1;
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(start);
        const newValue = beforeCursor + '\n' + nextNumber + '. ' + afterCursor;
        handleMemoChange(newValue);

        // カーソル位置を設定
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + 3 + nextNumber.toString().length;
        }, 0);
      }
    }
  };

  return (
    <Card>
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
                {formatMarkdownText(trip.memo)}
              </div>
            </div>
          )}

          {canEdit ? (
            <textarea
              value={trip.memo}
              onChange={(e) => handleMemoChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="# 大見出し ## 中見出し ### 小見出し
- 箇条書き
1. 番号付きリスト
URLはリンクになります。"
              className="w-full h-96 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none text-stone-900 bg-white"
            />
          ) : (
            <div className="w-full h-96 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg whitespace-pre-wrap break-words overflow-y-auto">
              {trip.memo || 'メモがありません'}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
