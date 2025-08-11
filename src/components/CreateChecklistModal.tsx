'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Trip, Checklist, ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';
import { Button, CancelButton, SaveButton } from './buttons';
import Modal from './Modal';

interface CreateChecklistModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
  onCreateChecklist: (checklist: Checklist) => void;
}

export default function CreateChecklistModal({
  isOpen,
  trip,
  onClose,
  onCreateChecklist,
}: CreateChecklistModalProps) {
  const [newChecklist, setNewChecklist] = useState({ name: '', items: [''] });

  const addNewChecklistCategory = () => {
    if (!newChecklist.name) return;

    const checklistCategory: Checklist = {
      id: Date.now().toString(),
      tripId: trip.id.toString(),
      name: newChecklist.name,
      items: newChecklist.items
        .filter((item) => item.trim())
        .map(
          (item, index): ChecklistItem => ({
            id: (Date.now() + index).toString(),
            text: item.trim(),
            checked: false,
          })
        ),
    };

    onCreateChecklist(checklistCategory);
    setNewChecklist({ name: '', items: [''] });
    onClose();
  };

  const handleClose = () => {
    onClose();
    setNewChecklist({ name: '', items: [''] });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="新しいチェックリスト"
      icon={Plus}
      iconColor={colorPalette.roseQuartz.bg}
      maxWidth="md"
    >
      <div className="space-y-4">
        <input
          type="text"
          placeholder="リスト名"
          value={newChecklist.name}
          onChange={(e) =>
            setNewChecklist({ ...newChecklist, name: e.target.value })
          }
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-stone-900 bg-white"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">項目</label>
          {newChecklist.items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder={`項目 ${index + 1}`}
                value={item}
                onChange={(e) => {
                  const updatedItems = [...newChecklist.items];
                  updatedItems[index] = e.target.value;
                  setNewChecklist({
                    ...newChecklist,
                    items: updatedItems,
                  });
                }}
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm text-stone-900 bg-white"
              />
              {newChecklist.items.length > 1 && (
                <Button
                  onClick={() => {
                    const updatedItems = newChecklist.items.filter(
                      (_, i) => i !== index
                    );
                    setNewChecklist({
                      ...newChecklist,
                      items: updatedItems,
                    });
                  }}
                  variant="icon"
                  color="sandRed"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            onClick={() =>
              setNewChecklist({
                ...newChecklist,
                items: [...newChecklist.items, ''],
              })
            }
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            項目を追加
          </Button>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <CancelButton onClick={handleClose} className="flex-1" />
        <SaveButton
          onClick={addNewChecklistCategory}
          disabled={!newChecklist.name.trim()}
          type="create"
          className="flex-1"
        />
      </div>
    </Modal>
  );
}
