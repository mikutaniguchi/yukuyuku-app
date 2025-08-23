'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Settings, Edit2, Trash2 } from 'lucide-react';
import { Checklist, ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';
import Card from './Card';
import InlineEditForm from './InlineEditForm';
import Dropdown, { DropdownOption } from './Dropdown';
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
  editingItem: string | null;
  editingText: string;
  swipedItem: string | null;
  onSetShowSettings: (id: string | null) => void;
  onEditChecklistName: (id: string, name: string) => void;
  onSaveChecklistName: (id: string, newName?: string) => void;
  onCancelEditChecklistName: () => void;
  onDeleteChecklist: (id: string) => void;
  onDragEnd: (event: DragEndEvent, checklistId: string) => void;
  onToggleChecklistItem: (checklistId: string, itemId: string) => void;
  onStartEditingItem: (item: ChecklistItem) => void;
  onUpdateEditingText: (text: string) => void;
  onSaveEditingItem: (checklistId: string, itemId: string) => void;
  onCancelEditingItem: () => void;
  onDeleteChecklistItem: (checklistId: string, itemId: string) => void;
  onAddChecklistItem: (checklistId: string, text: string) => void;
  onSwipe: (itemId: string, deltaX: number) => void;
  onSetSwipedItem: (itemId: string | null) => void;
  checklistSettingsValue?: string;
  onChecklistSettingsChange?: (value: string) => void;
}

export default function ChecklistCard({
  checklist,
  canEdit,
  completionRate,
  showSettings,
  editingChecklistName,
  editingItem,
  editingText,
  swipedItem,
  onSetShowSettings,
  onEditChecklistName,
  onSaveChecklistName,
  onCancelEditChecklistName,
  onDeleteChecklist,
  onDragEnd,
  onToggleChecklistItem,
  onStartEditingItem,
  onUpdateEditingText,
  onSaveEditingItem,
  onCancelEditingItem,
  onDeleteChecklistItem,
  onAddChecklistItem,
  onSwipe,
  onSetSwipedItem,
  checklistSettingsValue = '',
  onChecklistSettingsChange,
}: ChecklistCardProps) {
  const settingsRef = useRef<HTMLDivElement>(null);
  const [newItemText, setNewItemText] = useState('');

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
          <InlineEditForm
            value={checklist.name}
            isEditing={editingChecklistName === checklist.id}
            onStartEdit={() =>
              onEditChecklistName(checklist.id, checklist.name)
            }
            onSave={(newName) => {
              // 新しい名前を直接渡して保存
              onSaveChecklistName(checklist.id, newName);
            }}
            onCancel={onCancelEditChecklistName}
            displayClassName="text-lg font-semibold text-stone-800"
            inputClassName="text-lg font-semibold"
            showEditButton={false}
          />
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
          <div className="relative">
            {(() => {
              const options: DropdownOption[] = [
                {
                  value: 'edit',
                  label: '名前を変更',
                  icon: Edit2,
                },
                {
                  value: 'delete',
                  label: 'リストを削除',
                  icon: Trash2,
                },
              ];

              const handleChange = (value: string) => {
                if (value === 'edit') {
                  onEditChecklistName(checklist.id, checklist.name);
                } else if (value === 'delete') {
                  onDeleteChecklist(checklist.id);
                }
                if (onChecklistSettingsChange) {
                  onChecklistSettingsChange(''); // Reset selection
                }
              };

              return (
                <Dropdown
                  options={options}
                  value={checklistSettingsValue}
                  onChange={handleChange}
                  placeholder={<Settings className="w-4 h-4" />}
                  showChevron={false}
                  showSelectedIcon={false}
                  position="right"
                  width="140px"
                  className="p-1 border-0 bg-transparent text-stone-400 hover:text-stone-900 opacity-60 hover:opacity-100 focus:outline-none"
                />
              );
            })()}
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
                  onUpdateEditingText={onUpdateEditingText}
                  onSwipe={onSwipe}
                  onCancelEdit={onCancelEditingItem}
                />
              </SortableChecklistItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {canEdit && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newItemText.trim()) {
              onAddChecklistItem(checklist.id, newItemText.trim());
              setNewItemText('');
            }
          }}
        >
          <input
            type="text"
            placeholder="新しい項目を追加..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm text-stone-900 bg-white"
          />
        </form>
      )}
    </Card>
  );
}
