'use client';

import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Users, MapPin, Calendar, Clock } from 'lucide-react';
import { Trip, CustomTag } from '@/types';
import { colorPalette } from '@/lib/constants';

interface TagsPageProps {
  trip: Trip;
  onTripUpdate: (tripId: number, updateFunction: (trip: Trip) => Trip) => void;
}

export default function TagsPage({ trip, onTripUpdate }: TagsPageProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'sightseeing': return <MapPin className="w-4 h-4" />;
      case 'departure': return <Calendar className="w-4 h-4" />;
      case 'meal': return <Clock className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const addNewTag = () => {
    const newTag: CustomTag = {
      id: `custom_${Date.now()}`,
      name: "新しいタグ",
      color: "bg-stone-200 text-stone-800"
    };

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      customTags: [...currentTrip.customTags, newTag]
    }));
  };

  // const updateTag = (tagId: string, updatedTag: Partial<CustomTag>) => {
  //   onTripUpdate(trip.id, (currentTrip) => ({
  //     ...currentTrip,
  //     customTags: currentTrip.customTags.map(tag => 
  //       tag.id === tagId ? { ...tag, ...updatedTag } : tag
  //     )
  //   }));
  //   setEditingTag(null);
  // };

  const deleteTag = (tagId: string) => {
    // デフォルトタグは削除不可
    const defaultTags = ['meeting', 'sightseeing', 'departure', 'meal'];
    if (defaultTags.includes(tagId)) {
      alert('デフォルトタグは削除できません');
      return;
    }

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      customTags: currentTrip.customTags.filter(tag => tag.id !== tagId)
    }));
  };

  const getTagUsageCount = (tagId: string) => {
    let count = 0;
    Object.values(trip.schedules).forEach(daySchedules => {
      daySchedules.forEach(schedule => {
        if (schedule.type === tagId) count++;
      });
    });
    return count;
  };

  const colorOptions = [
    { value: "bg-stone-200 text-stone-800", name: "ストーン", preview: "#D6D3D1" },
    { value: "bg-emerald-200 text-emerald-800", name: "エメラルド", preview: "#A7F3D0" },
    { value: "bg-rose-200 text-rose-800", name: "ローズ", preview: "#FECDD3" },
    { value: "bg-amber-200 text-amber-800", name: "アンバー", preview: "#FDE68A" },
    { value: "bg-blue-200 text-blue-800", name: "ブルー", preview: "#BFDBFE" },
    { value: "bg-purple-200 text-purple-800", name: "パープル", preview: "#DDD6FE" },
    { value: "bg-slate-200 text-slate-800", name: "スレート", preview: "#CBD5E1" },
    { value: "bg-teal-200 text-teal-800", name: "ティール", preview: "#99F6E4" },
    { value: "bg-orange-200 text-orange-800", name: "オレンジ", preview: "#FED7AA" },
    { value: "bg-pink-200 text-pink-800", name: "ピンク", preview: "#FBCFE8" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-800">タグ設定</h2>
        <button
          onClick={addNewTag}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors font-medium"
          style={{ 
            backgroundColor: colorPalette.rubyGrey.bg,
            color: colorPalette.rubyGrey.text 
          }}
        >
          <Plus className="w-4 h-4" />
          新しいタグ
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">タグの使い方</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• タグを使ってスケジュールをカテゴリ分けできます</li>
          <li>• 各タグに色を設定して見やすくカスタマイズ可能</li>
          <li>• デフォルトタグ（集合、観光、出発、食事）は削除できません</li>
          <li>• 使用中のタグを削除すると、そのスケジュールはデフォルトタグに変更されます</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trip.customTags.map(tag => {
          const usageCount = getTagUsageCount(tag.id);
          const isDefaultTag = ['meeting', 'sightseeing', 'departure', 'meal'].includes(tag.id);
          
          return (
            <div key={tag.id} className="bg-white border border-stone-200 rounded-lg p-4">
              {editingTag === tag.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tag.name}
                    onChange={(e) => {
                      onTripUpdate(trip.id, (currentTrip) => ({
                        ...currentTrip,
                        customTags: currentTrip.customTags.map(t => 
                          t.id === tag.id ? { ...t, name: e.target.value } : t
                        )
                      }));
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="タグ名"
                  />
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">色</label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map(colorOption => (
                        <button
                          key={colorOption.value}
                          onClick={() => {
                            onTripUpdate(trip.id, (currentTrip) => ({
                              ...currentTrip,
                              customTags: currentTrip.customTags.map(t => 
                                t.id === tag.id ? { ...t, color: colorOption.value } : t
                              )
                            }));
                          }}
                          className={`w-8 h-8 rounded border-2 transition-colors ${
                            tag.color === colorOption.value ? 'border-stone-400' : 'border-stone-200'
                          }`}
                          style={{ backgroundColor: colorOption.preview }}
                          title={colorOption.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTag(null)}
                      className="px-3 py-1 text-white rounded-lg transition-colors text-sm font-medium"
                      style={{ 
                        backgroundColor: colorPalette.abyssGreen.bg,
                        color: colorPalette.abyssGreen.text 
                      }}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingTag(null)}
                      className="px-3 py-1 text-white rounded-lg transition-colors text-sm font-medium"
                      style={{ 
                        backgroundColor: colorPalette.sandRed.bg,
                        color: colorPalette.sandRed.text 
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${tag.color}`}>
                      {getTypeIcon(tag.id)}
                      {tag.name}
                    </span>
                    <div className="flex flex-col text-xs text-stone-500">
                      <span>{usageCount}回使用</span>
                      {isDefaultTag && <span className="text-blue-600">デフォルト</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTag(tag.id)}
                      className="p-1 text-stone-500 hover:text-blue-600 transition-colors"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isDefaultTag && (
                      <button
                        onClick={() => {
                          if (usageCount > 0) {
                            const confirmed = confirm(`このタグは${usageCount}回使用されています。削除してもよろしいですか？`);
                            if (confirmed) deleteTag(tag.id);
                          } else {
                            deleteTag(tag.id);
                          }
                        }}
                        className="p-1 text-stone-500 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* タグ使用状況 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">タグ使用状況</h3>
        {trip.customTags.some(tag => getTagUsageCount(tag.id) > 0) ? (
          <div className="space-y-3">
            {trip.customTags
              .filter(tag => getTagUsageCount(tag.id) > 0)
              .sort((a, b) => getTagUsageCount(b.id) - getTagUsageCount(a.id))
              .map(tag => {
                const count = getTagUsageCount(tag.id);
                const totalSchedules = Object.values(trip.schedules).reduce((total, daySchedules) => total + daySchedules.length, 0);
                const percentage = totalSchedules > 0 ? Math.round((count / totalSchedules) * 100) : 0;
                
                return (
                  <div key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${tag.color}`}>
                        {getTypeIcon(tag.id)}
                        {tag.name}
                      </span>
                      <div className="flex-1 bg-stone-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colorPalette.aquaBlue.bg
                          }}
                        />
                      </div>
                      <span className="text-sm text-stone-500 min-w-12">{percentage}%</span>
                    </div>
                    <span className="font-medium text-stone-800 min-w-16 text-right">
                      {count}回
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500">
            <Settings className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p>まだタグが使用されていません</p>
            <p className="text-sm">スケジュールを追加してタグを使ってみましょう</p>
          </div>
        )}
      </div>
    </div>
  );
}