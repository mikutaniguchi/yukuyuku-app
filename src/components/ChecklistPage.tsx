'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  X,
  Settings,
  Edit2,
  Save,
  Check,
} from 'lucide-react';
import { Trip, Checklist, ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';
import Button from './Button';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableChecklistItem from './SortableChecklistItem';
import LoadingSpinner from './LoadingSpinner';

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
  const [newChecklist, setNewChecklist] = useState({ name: '', items: [''] });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [editingChecklistName, setEditingChecklistName] = useState<
    string | null
  >(null);
  const [tempChecklistName, setTempChecklistName] = useState('');
  const [swipedItem, setSwipedItem] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { handleEnterKey, handleEscapeKey } = useKeyboardEvent();

  // ページ読み込み完了の模擬
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  // ドラッグ終了時の処理
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
          // チェック済みアイテムを下に移動
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
          ? {
              ...checklist,
              items: [...checklist.items, newItem],
            }
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
    const inputValue = editingInputRef.current?.value || editingText;
    if (!inputValue.trim()) return;

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId ? { ...item, text: inputValue.trim() } : item
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
    // 左スワイプ（負の値）で削除ボタンを表示
    if (deltaX < -50) {
      setSwipedItem(itemId);
    } else if (deltaX > 50 || Math.abs(deltaX) < 10) {
      // 右スワイプまたは小さな移動で閉じる
      setSwipedItem(null);
    }
  };

  const SwipeableItem = ({
    children,
    itemId,
    onSwipe,
  }: {
    children: React.ReactNode;
    itemId: string;
    onSwipe: (itemId: string, deltaX: number) => void;
  }) => {
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
      onSwipe(itemId, deltaX);
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
        {children}
      </div>
    );
  };

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

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: [...currentTrip.checklists, checklistCategory],
    }));

    setNewChecklist({ name: '', items: [''] });
    setShowNewChecklistModal(false);
  };

  const getCompletionRate = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(
      (item) => item.checked
    ).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(null);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

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
              {trip.checklists.map((checklist) => {
                const completionRate = getCompletionRate(checklist);
                return (
                  <div
                    key={checklist.id}
                    className="bg-white rounded-xl shadow-sm border border-stone-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {editingChecklistName === checklist.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tempChecklistName}
                              onChange={(e) =>
                                setTempChecklistName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                handleEnterKey(e, () =>
                                  saveChecklistName(checklist.id)
                                );
                                handleEscapeKey(e, () =>
                                  cancelEditChecklistName()
                                );
                              }}
                              className="text-lg font-semibold text-stone-800 bg-transparent border-b-2 border-stone-300 focus:outline-none focus:border-stone-500"
                              autoFocus
                            />
                            <Button
                              onClick={() => saveChecklistName(checklist.id)}
                              variant="icon"
                              color="abyssGreen"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={cancelEditChecklistName}
                              variant="icon"
                            >
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
                              setShowSettings(
                                showSettings === checklist.id
                                  ? null
                                  : checklist.id
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
                                  handleEditChecklistName(
                                    checklist.id,
                                    checklist.name
                                  )
                                }
                                variant="ghost"
                                fullWidth
                                className="justify-start px-4 py-2 text-left text-stone-700 hover:bg-stone-50"
                              >
                                <Edit2 className="w-4 h-4" />
                                名前を変更
                              </Button>
                              <Button
                                onClick={() => deleteChecklist(checklist.id)}
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
                      onDragEnd={(event) => handleDragEnd(event, checklist.id)}
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
                              <SwipeableItem
                                itemId={item.id}
                                onSwipe={handleSwipe}
                              >
                                <div className="relative overflow-hidden">
                                  <div
                                    className={`flex items-center gap-3 group transition-transform duration-200 ${
                                      swipedItem === item.id
                                        ? '-translate-x-16'
                                        : 'translate-x-0'
                                    }`}
                                  >
                                    <button
                                      onClick={() =>
                                        toggleChecklistItem(
                                          checklist.id,
                                          item.id
                                        )
                                      }
                                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        item.checked
                                          ? 'text-white shadow-sm'
                                          : 'border-stone-300 hover:border-stone-400'
                                      }`}
                                      style={
                                        item.checked
                                          ? {
                                              backgroundColor:
                                                colorPalette.abyssGreen.bg,
                                              borderColor:
                                                colorPalette.abyssGreen.bg,
                                              color:
                                                colorPalette.abyssGreen.text,
                                            }
                                          : {}
                                      }
                                    >
                                      {item.checked && (
                                        <svg
                                          className="w-3 h-3"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                    {editingItem === item.id ? (
                                      <div className="flex-1 flex items-center gap-2">
                                        <input
                                          ref={editingInputRef}
                                          type="text"
                                          defaultValue={editingText}
                                          onKeyDown={(e) => {
                                            handleEnterKey(e, () =>
                                              saveEditingItem(
                                                checklist.id,
                                                item.id
                                              )
                                            );
                                            handleEscapeKey(e, () =>
                                              cancelEditingItem()
                                            );
                                          }}
                                          className="flex-1 px-2 py-1 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-stone-900 bg-white"
                                          autoFocus
                                        />
                                        <Button
                                          onClick={() =>
                                            saveEditingItem(
                                              checklist.id,
                                              item.id
                                            )
                                          }
                                          variant="icon"
                                          color="abyssGreen"
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          onClick={cancelEditingItem}
                                          variant="icon"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <span
                                          className={`flex-1 ${item.checked ? 'line-through text-stone-500' : 'text-stone-700'} ${canEdit ? 'cursor-pointer' : ''} text-sm md:text-base`}
                                          onClick={
                                            canEdit
                                              ? () => startEditingItem(item)
                                              : undefined
                                          }
                                        >
                                          {item.text}
                                        </span>
                                        {/* デスクトップ用ボタン（hover表示） */}
                                        {canEdit && (
                                          <div className="hidden md:flex gap-1">
                                            <Button
                                              onClick={() =>
                                                startEditingItem(item)
                                              }
                                              variant="icon"
                                              className="opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                deleteChecklistItem(
                                                  checklist.id,
                                                  item.id
                                                )
                                              }
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
                                      swipedItem === item.id
                                        ? 'translate-x-0'
                                        : 'translate-x-full'
                                    }`}
                                  >
                                    <Button
                                      onClick={() => {
                                        deleteChecklistItem(
                                          checklist.id,
                                          item.id
                                        );
                                        setSwipedItem(null);
                                      }}
                                      variant="filled"
                                      color="sandRed"
                                      className="h-full px-4 rounded-none"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </SwipeableItem>
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
                                addChecklistItem(
                                  checklist.id,
                                  e.currentTarget.value
                                );
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
                  </div>
                );
              })}
            </div>

            {!isLoading && trip.checklists.length === 0 && (
              <div className="text-center py-12 text-stone-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                <p>チェックリストがまだありません</p>
                {canEdit && (
                  <Button
                    onClick={() => setShowNewChecklistModal(true)}
                    variant="filled"
                    color="roseQuartz"
                    className="mt-4"
                  >
                    リストを作成
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Checklist Modal */}
      {showNewChecklistModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowNewChecklistModal(false);
            setNewChecklist({ name: '', items: [''] });
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-stone-800">
              新しいチェックリスト
            </h3>
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
                <label className="text-sm font-medium text-stone-700">
                  項目
                </label>
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
            <div className="flex gap-3 mt-6">
              <Button
                onClick={addNewChecklistCategory}
                disabled={!newChecklist.name.trim()}
                variant="filled"
                color="roseQuartz"
                fullWidth
              >
                作成
              </Button>
              <Button
                onClick={() => {
                  setShowNewChecklistModal(false);
                  setNewChecklist({ name: '', items: [''] });
                }}
                variant="filled"
                color="sandRed"
                fullWidth
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
