'use client';

import React, { useRef, useEffect } from 'react';
import { Settings, Edit2, Trash2, Save, X } from 'lucide-react';
import { Checklist, ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';
import Button from './Button';
import Card from './Card';
import { useKeyboardEvent } from '@/hooks/useKeyboardEvent';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableChecklistItem from './SortableChecklistItem';
import ChecklistItemComponent from './ChecklistItemComponent';

interface ChecklistCardProps {
  checklist: Checklist;
  canEdit: boolean;
  completionRate: number;
  showSettings: string | null;
  editingChecklistName: string | null;
  tempChecklistName: string;
  editingItem: string | null;
  editingText: string;
  swipedItem: string | null;
  onSetShowSettings: (id: string | null) => void;
  onEditChecklistName: (id: string, name: string) => void;
  onSaveChecklistName: (id: string) => void;
  onCancelEditChecklistName: () => void;
  onSetTempChecklistName: (name: string) => void;
  onDeleteChecklist: (id: string) => void;
  onDragEnd: (event: DragEndEvent, checklistId: string) => void;
  onToggleChecklistItem: (checklistId: string, itemId: string) => void;
  onStartEditingItem: (item: ChecklistItem) => void;
  onSaveEditingItem: (checklistId: string, itemId: string) => void;
  onCancelEditingItem: () => void;
  onDeleteChecklistItem: (checklistId: string, itemId: string) => void;
  onAddChecklistItem: (checklistId: string, text: string) => void;
  onSwipe: (itemId: string, deltaX: number) => void;
  onSetSwipedItem: (itemId: string | null) => void;
}

export default function ChecklistCard({
  checklist,
  canEdit,
  completionRate,
  showSettings,
  editingChecklistName,
  tempChecklistName,
  editingItem,
  editingText,
  swipedItem,
  onSetShowSettings,
  onEditChecklistName,
  onSaveChecklistName,
  onCancelEditChecklistName,
  onSetTempChecklistName,
  onDeleteChecklist,
  onDragEnd,
  onToggleChecklistItem,
  onStartEditingItem,
  onSaveEditingItem,
  onCancelEditingItem,
  onDeleteChecklistItem,
  onAddChecklistItem,
  onSwipe,
  onSetSwipedItem,
}: ChecklistCardProps) {
  const settingsRef = useRef<HTMLDivElement>(null);
  const { handleEnterKey, handleEscapeKey } = useKeyboardEvent();

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        onSetShowSettings(null);
      }
    };

    if (showSettings === checklist.id) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings, checklist.id, onSetShowSettings]);

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {editingChecklistName === checklist.id ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempChecklistName}
                onChange={(e) => onSetTempChecklistName(e.target.value)}
                onKeyDown={(e) => {
                  handleEnterKey(e, () => onSaveChecklistName(checklist.id));
                  handleEscapeKey(e, onCancelEditChecklistName);
                }}
                className="text-lg font-semibold text-stone-800 bg-transparent border-b-2 border-stone-300 focus:outline-none focus:border-stone-500"
                autoFocus
              />
              <Button
                onClick={() => onSaveChecklistName(checklist.id)}
                variant="icon"
                color="abyssGreen"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button onClick={onCancelEditChecklistName} variant="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-stone-800">
              {checklist.name}
            </h3>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-full bg-stone-200 rounded-full h-2 flex-1">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${completionRate}%`,
                  backgroundColor: colorPalette.abyssGreen.bg,
                }}
              />
            </div>
            <span className="text-sm text-stone-600 font-medium">
              {completionRate}%
            </span>
          </div>
        </div>
        {canEdit && (
          <div className="relative" ref={settingsRef}>
            <Button
              onClick={() =>
                onSetShowSettings(
                  showSettings === checklist.id ? null : checklist.id
                )
              }
              variant="icon"
              className="opacity-60 hover:opacity-100"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {showSettings === checklist.id && (
              <div className="absolute top-8 right-0 bg-white border border-stone-200 rounded-lg shadow-lg py-2 w-40 z-10">
                <Button
                  onClick={() =>
                    onEditChecklistName(checklist.id, checklist.name)
                  }
                  variant="ghost"
                  fullWidth
                  className="justify-start px-4 py-2 text-left text-stone-700 hover:bg-stone-50"
                >
                  <Edit2 className="w-4 h-4" />
                  名前を変更
                </Button>
                <Button
                  onClick={() => onDeleteChecklist(checklist.id)}
                  variant="ghost"
                  color="sandRed"
                  fullWidth
                  className="justify-start px-4 py-2 text-left hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  リストを削除
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => onDragEnd(event, checklist.id)}
      >
        <SortableContext
          items={checklist.items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mb-4 relative pl-6">
            {checklist.items.map((item) => (
              <SortableChecklistItem
                key={item.id}
                id={item.id}
                isEditing={canEdit}
              >
                <ChecklistItemComponent
                  item={item}
                  checklistId={checklist.id}
                  canEdit={canEdit}
                  swipedItem={swipedItem}
                  editingItem={editingItem}
                  editingText={editingText}
                  onToggleItem={onToggleChecklistItem}
                  onEditItem={(checklistId, itemId, _text) => {
                    // 現在の実装では親コンポーネントのeditingTextを使用
                    onSaveEditingItem(checklistId, itemId);
                  }}
                  onDeleteItem={(checklistId, itemId) => {
                    onDeleteChecklistItem(checklistId, itemId);
                    onSetSwipedItem(null);
                  }}
                  onStartEditing={onStartEditingItem}
                  onSwipe={onSwipe}
                  onCancelEdit={onCancelEditingItem}
                />
              </SortableChecklistItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {canEdit && (
        <div>
          <input
            type="text"
            placeholder="新しい項目を追加..."
            onKeyDown={(e) => {
              handleEnterKey(
                e,
                () => {
                  onAddChecklistItem(checklist.id, e.currentTarget.value);
                  e.currentTarget.value = '';
                },
                {
                  requireValue: true,
                  target: e.currentTarget,
                }
              );
            }}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm text-stone-900 bg-white"
          />
        </div>
      )}
    </Card>
  );
}
