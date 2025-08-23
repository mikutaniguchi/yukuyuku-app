'use client';

import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { getIcon, formatDate } from '@/lib/constants';
import { ScheduleFormData, ChecklistItem } from '@/types';

interface ScheduleFormProps {
  schedule: ScheduleFormData;
  onScheduleChange: (schedule: ScheduleFormData) => void;
  tripMembers: Array<{ id: string; name: string }>;
  tripDates: string[];
  iconOptions: Array<{
    id: string;
    name: string;
    bgColor: string;
    iconColor: string;
  }>;
}

export default function ScheduleForm({
  schedule,
  onScheduleChange,
  tripMembers,
  tripDates,
  iconOptions,
}: ScheduleFormProps) {
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // 現在時刻の時間のみを取得（分は00）
  const getCurrentHour = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  };

  // アイコン変更時の交通手段自動設定
  useEffect(() => {
    const iconTransportMap: Record<string, string> = {
      car: '車/タクシー',
      train: '電車',
      plane: '飛行機',
      bus: 'バス',
    };

    if (schedule.icon && iconTransportMap[schedule.icon]) {
      const correspondingTransport = iconTransportMap[schedule.icon];
      if (schedule.transport.method !== correspondingTransport) {
        onScheduleChange({
          ...schedule,
          transport: { ...schedule.transport, method: correspondingTransport },
        });
      }
    }
  }, [schedule.icon, onScheduleChange, schedule]);

  // 移動時間の自動計算
  useEffect(() => {
    const isTransportIcon = ['car', 'train', 'plane', 'bus'].includes(
      schedule.icon
    );
    const isTransportMethod = [
      '車/タクシー',
      '電車',
      '飛行機',
      'バス',
    ].includes(schedule.transport.method);

    if (
      (isTransportIcon || isTransportMethod) &&
      schedule.startTime &&
      schedule.endTime
    ) {
      const startTime = new Date(`2000-01-01T${schedule.startTime}`);
      const endTime = new Date(`2000-01-01T${schedule.endTime}`);

      if (endTime > startTime) {
        const diffMinutes = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        );
        const durationText = `${diffMinutes}分`;

        if (schedule.transport.duration !== durationText) {
          onScheduleChange({
            ...schedule,
            transport: { ...schedule.transport, duration: durationText },
          });
        }
      }
    }
  }, [
    schedule.icon,
    schedule.transport.method,
    schedule.startTime,
    schedule.endTime,
    onScheduleChange,
    schedule,
  ]);

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: `${Date.now()}_${Math.random()}`,
      text: newChecklistItem.trim(),
      checked: false,
    };

    onScheduleChange({
      ...schedule,
      checklistItems: [...schedule.checklistItems, newItem],
    });

    setNewChecklistItem('');
  };

  const removeChecklistItem = (itemId: string) => {
    onScheduleChange({
      ...schedule,
      checklistItems: schedule.checklistItems.filter(
        (item) => item.id !== itemId
      ),
    });
  };

  const toggleChecklistItem = (itemId: string) => {
    onScheduleChange({
      ...schedule,
      checklistItems: schedule.checklistItems.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    });
  };

  const updateChecklistItem = (itemId: string, newText: string) => {
    onScheduleChange({
      ...schedule,
      checklistItems: schedule.checklistItems.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          日付
        </label>
        <select
          value={schedule.date}
          onChange={(e) =>
            onScheduleChange({ ...schedule, date: e.target.value })
          }
          className="w-full md:w-1/2 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
        >
          {tripDates.map((date) => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
          <option value="unscheduled">日付未定</option>
        </select>
      </div>

      {schedule.date !== 'unscheduled' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              開始時間
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) =>
                  onScheduleChange({ ...schedule, startTime: e.target.value })
                }
                onFocus={(e) => {
                  if (!schedule.startTime) {
                    e.target.value = getCurrentHour();
                    onScheduleChange({
                      ...schedule,
                      startTime: getCurrentHour(),
                    });
                  }
                }}
                step="900"
                className="flex-1 max-w-[140px] px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
              />
              {schedule.startTime && (
                <button
                  type="button"
                  onClick={() =>
                    onScheduleChange({ ...schedule, startTime: '' })
                  }
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  title="リセット"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              終了時間（任意）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={schedule.endTime || ''}
                onChange={(e) =>
                  onScheduleChange({
                    ...schedule,
                    endTime: e.target.value || undefined,
                  })
                }
                onFocus={(e) => {
                  if (!schedule.endTime) {
                    const currentHour = getCurrentHour();
                    e.target.value = currentHour;
                    onScheduleChange({ ...schedule, endTime: currentHour });
                  }
                }}
                step="900"
                className="flex-1 max-w-[140px] px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
              />
              {schedule.endTime && (
                <button
                  type="button"
                  onClick={() =>
                    onScheduleChange({ ...schedule, endTime: undefined })
                  }
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  title="リセット"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="タイトル"
        value={schedule.title}
        onChange={(e) =>
          onScheduleChange({ ...schedule, title: e.target.value })
        }
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
      />

      <input
        type="text"
        placeholder="場所（Googleマップで開けます）"
        value={schedule.location}
        onChange={(e) =>
          onScheduleChange({ ...schedule, location: e.target.value })
        }
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
      />

      <textarea
        placeholder="詳細・メモ"
        value={schedule.description}
        onChange={(e) =>
          onScheduleChange({ ...schedule, description: e.target.value })
        }
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base resize-none min-h-[76px] text-stone-900 bg-white"
        rows={3}
      />

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">
              ¥
            </span>
            <input
              type="number"
              placeholder="例: 3000"
              value={schedule.budget === 0 ? '' : schedule.budget}
              onChange={(e) =>
                onScheduleChange({
                  ...schedule,
                  budget: parseInt(e.target.value) || 0,
                })
              }
              className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
            />
          </div>
          <select
            value={schedule.budgetPeople}
            onChange={(e) =>
              onScheduleChange({
                ...schedule,
                budgetPeople: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
          >
            {[...Array(6)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}人
              </option>
            ))}
          </select>
        </div>
        <select
          value={schedule.paidBy}
          onChange={(e) =>
            onScheduleChange({ ...schedule, paidBy: e.target.value })
          }
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
        >
          <option value="">立て替えなし</option>
          {tripMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}が立て替え
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-3">
        <h4 className="text-sm font-medium text-stone-700 mb-2">交通情報</h4>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={schedule.transport.method}
            onChange={(e) =>
              onScheduleChange({
                ...schedule,
                transport: { ...schedule.transport, method: e.target.value },
              })
            }
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
          >
            <option value="">交通手段</option>
            <option value="徒歩">徒歩</option>
            <option value="電車">電車</option>
            <option value="車/タクシー">車/タクシー</option>
            <option value="バス">バス</option>
            <option value="飛行機">飛行機</option>
          </select>
          <input
            type="text"
            placeholder="例: 30分"
            value={schedule.transport.duration}
            onChange={(e) =>
              onScheduleChange({
                ...schedule,
                transport: { ...schedule.transport, duration: e.target.value },
              })
            }
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          アイコン
        </label>
        <div className="flex gap-1">
          {iconOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onScheduleChange({ ...schedule, icon: option.id })}
              className={`p-2 rounded-full transition-colors duration-200 ${
                schedule.icon === option.id
                  ? 'border-2'
                  : 'hover:bg-stone-100 border-2 border-transparent'
              }`}
              style={{
                backgroundColor:
                  schedule.icon === option.id ? option.bgColor : 'transparent',
                color:
                  schedule.icon === option.id ? option.iconColor : '#6B7280',
                borderColor:
                  schedule.icon === option.id
                    ? option.iconColor
                    : 'transparent',
              }}
              title={option.name}
            >
              {option.id ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  {getIcon(option.id)}
                </div>
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          やること
        </label>

        <div className="space-y-2">
          {schedule.checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecklistItem(item.id)}
                className="w-4 h-4 text-stone-600 border-stone-300 rounded focus:ring-stone-500"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                className="flex-1 px-2 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-sm text-stone-900 bg-white"
              />
              <button
                type="button"
                onClick={() => removeChecklistItem(item.id)}
                className="p-1 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="チェック項目を追加"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base text-stone-900 bg-white"
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="px-3 py-2 border border-stone-300 text-stone-500 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
