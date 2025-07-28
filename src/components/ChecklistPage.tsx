'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, X, Settings, Edit2, Save } from 'lucide-react';
import { Trip, Checklist, ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';

interface ChecklistPageProps {
  trip: Trip;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
}

export default function ChecklistPage({ trip, onTripUpdate }: ChecklistPageProps) {
  const [showNewChecklistModal, setShowNewChecklistModal] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ name: "", items: [""] });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [editingChecklistName, setEditingChecklistName] = useState<string | null>(null);
  const [tempChecklistName, setTempChecklistName] = useState("");
  const [swipedItem, setSwipedItem] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map(checklist => {
        if (checklist.id === checklistId) {
          const updatedItems = checklist.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          );
          // チェック済みアイテムを下に移動
          updatedItems.sort((a, b) => Number(a.checked) - Number(b.checked));
          return { ...checklist, items: updatedItems };
        }
        return checklist;
      })
    }));
  };

  const addChecklistItem = (checklistId: string, text: string) => {
    if (!text.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: text.trim(),
      checked: false
    };

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map(checklist => 
        checklist.id === checklistId 
          ? { 
              ...checklist, 
              items: [...checklist.items, newItem] 
            }
          : checklist
      )
    }));
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map(checklist => 
        checklist.id === checklistId 
          ? { 
              ...checklist, 
              items: checklist.items.filter(item => item.id !== itemId) 
            }
          : checklist
      )
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
      checklists: currentTrip.checklists.map(checklist => 
        checklist.id === checklistId 
          ? { 
              ...checklist, 
              items: checklist.items.map(item => 
                item.id === itemId 
                  ? { ...item, text: editingText.trim() }
                  : item
              )
            }
          : checklist
      )
    }));
    
    setEditingItem(null);
    setEditingText("");
  };

  const cancelEditingItem = () => {
    setEditingItem(null);
    setEditingText("");
  };

  const deleteChecklist = (checklistId: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.filter(checklist => checklist.id !== checklistId)
    }));
    setShowSettings(null);
  };

  const handleEditChecklistName = (checklistId: string, currentName: string) => {
    setEditingChecklistName(checklistId);
    setTempChecklistName(currentName);
    setShowSettings(null);
  };

  const saveChecklistName = (checklistId: string) => {
    if (!tempChecklistName.trim()) return;
    
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.map(checklist => 
        checklist.id === checklistId 
          ? { ...checklist, name: tempChecklistName.trim() }
          : checklist
      )
    }));
    
    setEditingChecklistName(null);
    setTempChecklistName("");
  };

  const cancelEditChecklistName = () => {
    setEditingChecklistName(null);
    setTempChecklistName("");
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

  const SwipeableItem = ({ children, itemId, onSwipe }: { 
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
      items: newChecklist.items.filter(item => item.trim()).map((item, index): ChecklistItem => ({
        id: (Date.now() + index).toString(),
        text: item.trim(),
        checked: false
      }))
    };

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: [...currentTrip.checklists, checklistCategory]
    }));

    setNewChecklist({ name: "", items: [""] });
    setShowNewChecklistModal(false);
  };

  const getCompletionRate = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(item => item.checked).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
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
          <h2 className="text-xl font-semibold text-stone-800">チェックリスト</h2>
          <button
            onClick={() => setShowNewChecklistModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors font-medium"
            style={{ 
              backgroundColor: colorPalette.roseQuartz.bg,
              color: colorPalette.roseQuartz.text 
            }}
          >
            <Plus className="w-4 h-4" />
            新しいリスト
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trip.checklists.map(checklist => {
            const completionRate = getCompletionRate(checklist);
            return (
              <div key={checklist.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingChecklistName === checklist.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempChecklistName}
                          onChange={(e) => setTempChecklistName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveChecklistName(checklist.id);
                            if (e.key === 'Escape') cancelEditChecklistName();
                          }}
                          className="text-lg font-semibold text-stone-800 bg-transparent border-b-2 border-stone-300 focus:outline-none focus:border-stone-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveChecklistName(checklist.id)}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditChecklistName}
                          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold text-stone-800">{checklist.name}</h3>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-stone-200 rounded-full h-2 flex-1">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${completionRate}%`,
                            backgroundColor: colorPalette.abyssGreen.bg
                          }}
                        />
                      </div>
                      <span className="text-sm text-stone-600 font-medium">{completionRate}%</span>
                    </div>
                  </div>
                  <div className="relative" ref={settingsRef}>
                    <button
                      onClick={() => setShowSettings(showSettings === checklist.id ? null : checklist.id)}
                      className="p-1 text-stone-400 hover:text-stone-600 transition-colors opacity-60 hover:opacity-100"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {showSettings === checklist.id && (
                      <div className="absolute top-8 right-0 bg-white border border-stone-200 rounded-lg shadow-lg py-2 w-40 z-10">
                        <button
                          onClick={() => handleEditChecklistName(checklist.id, checklist.name)}
                          className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          名前を変更
                        </button>
                        <button
                          onClick={() => deleteChecklist(checklist.id)}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          リストを削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {checklist.items.map(item => (
                    <SwipeableItem key={item.id} itemId={item.id} onSwipe={handleSwipe}>
                      <div className="relative overflow-hidden">
                        <div className={`flex items-center gap-3 group transition-transform duration-200 ${
                          swipedItem === item.id ? '-translate-x-16' : 'translate-x-0'
                        }`}>
                          <button
                            onClick={() => toggleChecklistItem(checklist.id, item.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.checked 
                                ? 'text-white shadow-sm' 
                                : 'border-stone-300 hover:border-stone-400'
                            }`}
                            style={item.checked ? {
                              backgroundColor: colorPalette.abyssGreen.bg,
                              borderColor: colorPalette.abyssGreen.bg,
                              color: colorPalette.abyssGreen.text
                            } : {}}
                          >
                            {item.checked && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          {editingItem === item.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    saveEditingItem(checklist.id, item.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingItem();
                                  }
                                }}
                                className="flex-1 px-2 py-1 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEditingItem(checklist.id, item.id)}
                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={cancelEditingItem}
                                className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span 
                                className={`flex-1 ${item.checked ? 'line-through text-stone-500' : 'text-stone-700'} cursor-pointer text-sm md:text-base`}
                                onClick={() => startEditingItem(item)}
                              >
                                {item.text}
                              </span>
                              {/* デスクトップ用ボタン（hover表示） */}
                              <div className="hidden md:flex gap-1">
                                <button
                                  onClick={() => startEditingItem(item)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-blue-600 transition-all"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteChecklistItem(checklist.id, item.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* スマホ用：スワイプで表示される削除ボタン */}
                        <div className={`md:hidden absolute right-0 top-0 h-full flex items-center transition-transform duration-200 ${
                          swipedItem === item.id ? 'translate-x-0' : 'translate-x-full'
                        }`}>
                          <button
                            onClick={() => {
                              deleteChecklistItem(checklist.id, item.id);
                              setSwipedItem(null);
                            }}
                            className="h-full px-4 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </SwipeableItem>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="新しい項目を追加..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addChecklistItem(checklist.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {trip.checklists.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-stone-300" />
            <p>チェックリストがまだありません</p>
            <button
              onClick={() => setShowNewChecklistModal(true)}
              className="mt-4 px-4 py-2 text-white rounded-lg transition-colors font-medium"
              style={{ 
                backgroundColor: colorPalette.roseQuartz.bg,
                color: colorPalette.roseQuartz.text 
              }}
            >
              最初のリストを作成
            </button>
          </div>
        )}
      </div>

      {/* New Checklist Modal */}
      {showNewChecklistModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowNewChecklistModal(false);
            setNewChecklist({ name: "", items: [""] });
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-stone-800">新しいチェックリスト</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="リスト名"
                value={newChecklist.name}
                onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
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
                        setNewChecklist({ ...newChecklist, items: updatedItems });
                      }}
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm"
                    />
                    {newChecklist.items.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedItems = newChecklist.items.filter((_, i) => i !== index);
                          setNewChecklist({ ...newChecklist, items: updatedItems });
                        }}
                        className="p-2 text-stone-500 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewChecklist({ ...newChecklist, items: [...newChecklist.items, ""] })}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  項目を追加
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addNewChecklistCategory}
                disabled={!newChecklist.name.trim()}
                className="flex-1 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: colorPalette.roseQuartz.bg,
                  color: colorPalette.roseQuartz.text 
                }}
              >
                作成
              </button>
              <button
                onClick={() => {
                  setShowNewChecklistModal(false);
                  setNewChecklist({ name: "", items: [""] });
                }}
                className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
                style={{ 
                  backgroundColor: colorPalette.sandRed.bg,
                  color: colorPalette.sandRed.text 
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}