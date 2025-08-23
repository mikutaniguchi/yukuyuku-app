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
import ChecklistItemComponent from './ChecklistItemComponent';
import { getIcon, formatDate } from '@/lib/constants';

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
  const [pendingSortChecklistId, setPendingSortChecklistId] = useState<
    string | null
  >(null);

  // pendingSortChecklistIdが変更されたときの処理
  useEffect(() => {
    if (!pendingSortChecklistId) return;

    const timer = setTimeout(() => {
      onTripUpdate(trip.id, (currentTrip) => ({
        ...currentTrip,
        checklists: currentTrip.checklists.map((checklist) => {
          if (checklist.id === pendingSortChecklistId) {
            const sortedItems = [...checklist.items].sort(
              (a, b) => Number(a.checked) - Number(b.checked)
            );
            return { ...checklist, items: sortedItems };
          }
          return checklist;
        }),
      }));
      setPendingSortChecklistId(null);
    }, 200);

    return () => clearTimeout(timer);
  }, [pendingSortChecklistId, trip.id, onTripUpdate]);
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
  const [editingScheduleItem, setEditingScheduleItem] = useState<string | null>(
    null
  );
  const [editingScheduleText, setEditingScheduleText] = useState('');

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
    // チェック状態を更新（ソートはuseEffectで遅延実行）
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) => {
        if (checklist.id === checklistId) {
          const updatedItems = checklist.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          );
          return { ...checklist, items: updatedItems };
        }
        return checklist;
      }),
    }));

    // 0.2秒後にソートするためのマーカーを設定
    setPendingSortChecklistId(checklistId);
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

  const updateEditingText = (text: string) => {
    setEditingText(text);
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

  const saveChecklistName = (checklistId: string, newName?: string) => {
    const nameToSave = newName !== undefined ? newName : tempChecklistName;
    if (!nameToSave.trim()) return;

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) =>
        checklist.id === checklistId
          ? { ...checklist, name: nameToSave.trim() }
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

  const handleScheduleItemSwipe = (
    scheduleId: string,
    itemId: string,
    deltaX: number
  ) => {
    const swipeId = `${scheduleId}_${itemId}`;
    if (deltaX < -50) {
      setSwipedItem(swipeId);
    } else if (deltaX > 50 || Math.abs(deltaX) < 10) {
      setSwipedItem(null);
    }
  };

  // スケジュール項目編集関数
  const startEditingScheduleItem = (
    scheduleId: string,
    itemId: string,
    currentText: string
  ) => {
    setEditingScheduleItem(`${scheduleId}_${itemId}`);
    setEditingScheduleText(currentText);
  };

  const saveScheduleChecklistItem = (
    scheduleId: string,
    itemId: string,
    text: string,
    date?: string
  ) => {
    if (!text.trim() || !date) return;

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      schedules: {
        ...currentTrip.schedules,
        [date]: currentTrip.schedules[date].map((s) =>
          s.id === scheduleId
            ? {
                ...s,
                checklistItems: s.checklistItems.map((checkItem) =>
                  checkItem.id === itemId
                    ? { ...checkItem, text: text.trim() }
                    : checkItem
                ),
              }
            : s
        ),
      },
    }));

    setEditingScheduleItem(null);
    setEditingScheduleText('');
  };

  const cancelEditingScheduleItem = () => {
    setEditingScheduleItem(null);
    setEditingScheduleText('');
  };

  const toggleScheduleChecklistItem = (
    scheduleId: string,
    itemId: string,
    date?: string
  ) => {
    if (!date) return;
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      schedules: {
        ...currentTrip.schedules,
        [date]: currentTrip.schedules[date].map((s) =>
          s.id === scheduleId
            ? {
                ...s,
                checklistItems: s.checklistItems.map((checkItem) =>
                  checkItem.id === itemId
                    ? { ...checkItem, checked: !checkItem.checked }
                    : checkItem
                ),
              }
            : s
        ),
      },
    }));
  };

  const deleteScheduleChecklistItem = (
    scheduleId: string,
    itemId: string,
    date?: string
  ) => {
    if (!date) return;
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      schedules: {
        ...currentTrip.schedules,
        [date]: currentTrip.schedules[date].map((s) =>
          s.id === scheduleId
            ? {
                ...s,
                checklistItems: s.checklistItems.filter(
                  (checkItem) => checkItem.id !== itemId
                ),
              }
            : s
        ),
      },
    }));
    setSwipedItem(null);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                  onDeleteChecklist={deleteChecklist}
                  onDragEnd={handleDragEnd}
                  onToggleChecklistItem={toggleChecklistItem}
                  onStartEditingItem={startEditingItem}
                  onUpdateEditingText={updateEditingText}
                  onSaveEditingItem={saveEditingItem}
                  onCancelEditingItem={cancelEditingItem}
                  onDeleteChecklistItem={deleteChecklistItem}
                  onAddChecklistItem={addChecklistItem}
                  onSwipe={handleSwipe}
                  onSetSwipedItem={setSwipedItem}
                />
              ))}
              {/* スケジュールチェックリストセクション */}
              {Object.values(trip.schedules)
                .flat()
                .some((schedule) => schedule.checklistItems?.length > 0) && (
                <div className="bg-white border border-stone-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">
                    スケジュールより
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(trip.schedules)
                      .sort(([dateA], [dateB]) => {
                        if (dateA === 'unscheduled') return 1;
                        if (dateB === 'unscheduled') return -1;
                        return dateA.localeCompare(dateB);
                      })
                      .map(([date, schedules]) =>
                        schedules
                          .filter(
                            (schedule) => schedule.checklistItems?.length > 0
                          )
                          .map((schedule) => (
                            <div key={schedule.id}>
                              <h4 className="mb-3 flex items-center gap-2">
                                <span className="text-sm text-stone-600">
                                  {date === 'unscheduled'
                                    ? '日付未定'
                                    : formatDate(date)}
                                </span>
                                {schedule.icon && (
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    {getIcon(schedule.icon)}
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-stone-800">
                                  {schedule.title}
                                </span>
                              </h4>
                              <div className="space-y-2 ml-6">
                                {schedule.checklistItems.map((item) => {
                                  return (
                                    <ChecklistItemComponent
                                      key={item.id}
                                      item={item}
                                      checklistId={schedule.id}
                                      canEdit={canEdit}
                                      swipedItem={swipedItem}
                                      onToggleItem={toggleScheduleChecklistItem}
                                      onEditItem={saveScheduleChecklistItem}
                                      onDeleteItem={deleteScheduleChecklistItem}
                                      onStartEditing={(item) =>
                                        startEditingScheduleItem(
                                          schedule.id,
                                          item.id,
                                          item.text
                                        )
                                      }
                                      onUpdateEditingText={
                                        setEditingScheduleText
                                      }
                                      onSwipe={(itemId, deltaX) =>
                                        handleScheduleItemSwipe(
                                          schedule.id,
                                          itemId,
                                          deltaX
                                        )
                                      }
                                      editingItem={editingScheduleItem}
                                      editingText={editingScheduleText}
                                      onCancelEdit={cancelEditingScheduleItem}
                                      scheduleId={schedule.id}
                                      scheduleDate={date}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))
                      )}
                  </div>
                </div>
              )}
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
