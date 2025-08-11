'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Trip, Checklist, ChecklistItem } from '@/types';
import { Button } from './buttons';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import LoadingSpinner from './LoadingSpinner';
import ChecklistCard from './ChecklistCard';
import CreateChecklistModal from './CreateChecklistModal';

interface ChecklistPageProps {
  trip: Trip;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
  canEdit?: boolean;
}

export default function ChecklistPage({
  trip,
  onTripUpdate,
  canEdit = true,
}: ChecklistPageProps) {
  const [showNewChecklistModal, setShowNewChecklistModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [editingChecklistName, setEditingChecklistName] = useState<
    string | null
  >(null);
  const [tempChecklistName, setTempChecklistName] = useState('');
  const [swipedItem, setSwipedItem] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ページ読み込み完了の模擬
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDragEnd = (event: DragEndEvent, checklistId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onTripUpdate(trip.id, (currentTrip) => ({
        ...currentTrip,
        checklists: currentTrip.checklists.map((checklist) => {
          if (checklist.id === checklistId) {
            const oldIndex = checklist.items.findIndex(
              (item) => item.id === active.id
            );
            const newIndex = checklist.items.findIndex(
              (item) => item.id === over.id
            );
            return {
              ...checklist,
              items: arrayMove(checklist.items, oldIndex, newIndex),
            };
          }
          return checklist;
        }),
      }));
    }
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) => {
        if (checklist.id === checklistId) {
          const updatedItems = checklist.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          );
          updatedItems.sort((a, b) => Number(a.checked) - Number(b.checked));
          return { ...checklist, items: updatedItems };
        }
        return checklist;
      }),
    }));
  };

  const addChecklistItem = async (checklistId: string, text: string) => {
    if (!text.trim() || isAddingItem) return;

    setIsAddingItem(true);
    const newItem: ChecklistItem = {
      id: `${Date.now()}_${Math.random()}`,
      text: text.trim(),
      checked: false,
    };

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) =>
        checklist.id === checklistId
          ? { ...checklist, items: [...checklist.items, newItem] }
          : checklist
      ),
    }));

    setTimeout(() => setIsAddingItem(false), 100);
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.filter((item) => item.id !== itemId),
            }
          : checklist
      ),
    }));
  };

  const startEditingItem = (item: { id: string; text: string }) => {
    setEditingItem(item.id);
    setEditingText(item.text);
  };

  const saveEditingItem = (checklistId: string, itemId: string) => {
    if (!editingText.trim()) return;

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId
                  ? { ...item, text: editingText.trim() }
                  : item
              ),
            }
          : checklist
      ),
    }));

    setEditingItem(null);
    setEditingText('');
  };

  const cancelEditingItem = () => {
    setEditingItem(null);
    setEditingText('');
  };

  const deleteChecklist = (checklistId: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.filter(
        (checklist) => checklist.id !== checklistId
      ),
    }));
    setShowSettings(null);
  };

  const handleEditChecklistName = (
    checklistId: string,
    currentName: string
  ) => {
    setEditingChecklistName(checklistId);
    setTempChecklistName(currentName);
    setShowSettings(null);
  };

  const saveChecklistName = (checklistId: string) => {
    if (!tempChecklistName.trim()) return;

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) =>
        checklist.id === checklistId
          ? { ...checklist, name: tempChecklistName.trim() }
          : checklist
      ),
    }));

    setEditingChecklistName(null);
    setTempChecklistName('');
  };

  const cancelEditChecklistName = () => {
    setEditingChecklistName(null);
    setTempChecklistName('');
  };

  const handleSwipe = (itemId: string, deltaX: number) => {
    if (deltaX < -50) {
      setSwipedItem(itemId);
    } else if (deltaX > 50 || Math.abs(deltaX) < 10) {
      setSwipedItem(null);
    }
  };

  const handleCreateChecklist = (checklist: Checklist) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: [...currentTrip.checklists, checklist],
    }));
  };

  const getCompletionRate = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(
      (item) => item.checked
    ).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-800">
            チェックリスト
          </h2>
          {canEdit && (
            <Button
              onClick={() => setShowNewChecklistModal(true)}
              variant="filled"
              color="roseQuartz"
            >
              <Plus className="w-4 h-4" />
              新しいリスト
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trip.checklists.map((checklist) => (
                <ChecklistCard
                  key={checklist.id}
                  checklist={checklist}
                  canEdit={canEdit}
                  completionRate={getCompletionRate(checklist)}
                  showSettings={showSettings}
                  editingChecklistName={editingChecklistName}
                  editingItem={editingItem}
                  editingText={editingText}
                  swipedItem={swipedItem}
                  onSetShowSettings={setShowSettings}
                  onEditChecklistName={handleEditChecklistName}
                  onSaveChecklistName={saveChecklistName}
                  onCancelEditChecklistName={cancelEditChecklistName}
                  onSetTempChecklistName={setTempChecklistName}
                  onDeleteChecklist={deleteChecklist}
                  onDragEnd={handleDragEnd}
                  onToggleChecklistItem={toggleChecklistItem}
                  onStartEditingItem={startEditingItem}
                  onSaveEditingItem={saveEditingItem}
                  onCancelEditingItem={cancelEditingItem}
                  onDeleteChecklistItem={deleteChecklistItem}
                  onAddChecklistItem={addChecklistItem}
                  onSwipe={handleSwipe}
                  onSetSwipedItem={setSwipedItem}
                />
              ))}
            </div>

            {!isLoading && trip.checklists.length === 0 && (
              <div className="text-center py-12 text-stone-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                <p>チェックリストがまだありません</p>
              </div>
            )}
          </>
        )}
      </div>

      <CreateChecklistModal
        isOpen={showNewChecklistModal}
        trip={trip}
        onClose={() => setShowNewChecklistModal(false)}
        onCreateChecklist={handleCreateChecklist}
      />
    </>
  );
}
