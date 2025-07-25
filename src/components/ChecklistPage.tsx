'use client';

import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, X } from 'lucide-react';
import { Trip, Checklist, ChecklistItem } from '@/types';
import { colorPalette } from '@/lib/constants';

interface ChecklistPageProps {
  trip: Trip;
  onTripUpdate: (tripId: number, updateFunction: (trip: Trip) => Trip) => void;
}

export default function ChecklistPage({ trip, onTripUpdate }: ChecklistPageProps) {
  const [showNewChecklistModal, setShowNewChecklistModal] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ name: "", items: [""] });

  const toggleChecklistItem = (checklistId: number, itemId: number) => {
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

  const addChecklistItem = (checklistId: number, text: string) => {
    if (!text.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now(),
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

  const deleteChecklistItem = (checklistId: number, itemId: number) => {
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

  const deleteChecklist = (checklistId: number) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      checklists: currentTrip.checklists.filter(checklist => checklist.id !== checklistId)
    }));
  };

  const addNewChecklistCategory = () => {
    if (!newChecklist.name) return;

    const checklistCategory: Checklist = {
      id: Date.now(),
      name: newChecklist.name,
      items: newChecklist.items.filter(item => item.trim()).map((item, index): ChecklistItem => ({
        id: Date.now() + index,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trip.checklists.map(checklist => {
            const completionRate = getCompletionRate(checklist);
            return (
              <div key={checklist.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-800">{checklist.name}</h3>
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
                  <button
                    onClick={() => deleteChecklist(checklist.id)}
                    className="p-1 text-stone-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {checklist.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 group">
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
                      <span className={`flex-1 ${item.checked ? 'line-through text-stone-500' : 'text-stone-700'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => deleteChecklistItem(checklist.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
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
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
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