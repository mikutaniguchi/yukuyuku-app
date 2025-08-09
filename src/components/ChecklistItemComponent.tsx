'use client';

import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';
import Button from './Button';
import InlineEditForm from './InlineEditForm';

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  checklistId: string;
  canEdit: boolean;
  swipedItem: string | null;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onEditItem: (checklistId: string, itemId: string, text: string) => void;
  onDeleteItem: (checklistId: string, itemId: string) => void;
  onStartEditing: (item: ChecklistItem) => void;
  onSwipe: (itemId: string, deltaX: number) => void;
  editingItem: string | null;
  editingText: string;
  onCancelEdit: () => void;
}

export default function ChecklistItemComponent({
  item,
  checklistId,
  canEdit,
  swipedItem,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onStartEditing,
  onSwipe,
  editingItem,
  editingText,
  onCancelEdit,
}: ChecklistItemComponentProps) {
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    onSwipe(item.id, deltaX);
    setIsDragging(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="relative overflow-hidden">
        <div
          className={`flex items-center gap-3 group transition-transform duration-200 ${
            swipedItem === item.id ? '-translate-x-16' : 'translate-x-0'
          }`}
        >
          <button
            onClick={() => onToggleItem(checklistId, item.id)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              item.checked
                ? 'text-white shadow-sm'
                : 'border-stone-300 hover:border-stone-400'
            }`}
            style={
              item.checked
                ? {
                    backgroundColor: colorPalette.abyssGreen.bg,
                    borderColor: colorPalette.abyssGreen.bg,
                    color: colorPalette.abyssGreen.text,
                  }
                : {}
            }
          >
            {item.checked && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {editingItem === item.id ? (
            <div className="flex-1">
              <InlineEditForm
                value={editingText}
                isEditing={true}
                onStartEdit={() => {}}
                onSave={(newText) => {
                  onEditItem(checklistId, item.id, newText);
                }}
                onCancel={onCancelEdit}
                inputClassName="text-sm px-2 py-1"
                showEditButton={false}
              />
            </div>
          ) : (
            <>
              <span
                className={`flex-1 ${item.checked ? 'line-through text-stone-500' : 'text-stone-700'} ${canEdit ? 'cursor-pointer' : ''} text-sm md:text-base`}
                onClick={canEdit ? () => onStartEditing(item) : undefined}
              >
                {item.text}
              </span>
              {/* デスクトップ用ボタン（hover表示） */}
              {canEdit && (
                <div className="hidden md:flex gap-1">
                  <Button
                    onClick={() => onStartEditing(item)}
                    variant="icon"
                    className="opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onDeleteItem(checklistId, item.id)}
                    variant="icon"
                    color="sandRed"
                    className="opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* スマホ用：スワイプで表示される削除ボタン */}
        <div
          className={`md:hidden absolute right-0 top-0 h-full flex items-center transition-transform duration-200 ${
            swipedItem === item.id ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <Button
            onClick={() => {
              onDeleteItem(checklistId, item.id);
            }}
            variant="filled"
            color="sandRed"
            className="h-full px-4 rounded-none"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
