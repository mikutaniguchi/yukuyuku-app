'use client';

import React from 'react';
import { X } from 'lucide-react';
import { getIcon, formatDate } from '@/lib/constants';
import { ScheduleFormData } from '@/types';

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
  // 現在時刻の時間のみを取得（分は00）
  const getCurrentHour = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
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
          className="w-full md:w-1/2 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
        >
          {tripDates.map((date) => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            開始時間
          </label>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) =>
              onScheduleChange({ ...schedule, startTime: e.target.value })
            }
            onFocus={(e) => {
              if (!schedule.startTime) {
                e.target.value = getCurrentHour();
                onScheduleChange({ ...schedule, startTime: getCurrentHour() });
              }
            }}
            className="w-full max-w-[140px] px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            終了時間（任意）
          </label>
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
            className="w-full max-w-[140px] px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
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

      <input
        type="text"
        placeholder="タイトル"
        value={schedule.title}
        onChange={(e) =>
          onScheduleChange({ ...schedule, title: e.target.value })
        }
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
      />

      <input
        type="text"
        placeholder="場所"
        value={schedule.location}
        onChange={(e) =>
          onScheduleChange({ ...schedule, location: e.target.value })
        }
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
      />

      <textarea
        placeholder="詳細・メモ"
        value={schedule.description}
        onChange={(e) =>
          onScheduleChange({ ...schedule, description: e.target.value })
        }
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base resize-none min-h-[76px]"
        rows={3}
      />

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="例: 3"
              value={schedule.budgetPeople}
              onChange={(e) =>
                onScheduleChange({
                  ...schedule,
                  budgetPeople: parseInt(e.target.value) || 1,
                })
              }
              className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
              min="1"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500">
              人
            </span>
          </div>
        </div>
        {schedule.budget > 0 && schedule.budgetPeople >= 2 && (
          <select
            value={schedule.paidBy}
            onChange={(e) =>
              onScheduleChange({ ...schedule, paidBy: e.target.value })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
          >
            <option value="">立て替えなし</option>
            {tripMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}が立て替え
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="border-t pt-3">
        <h4 className="text-sm font-medium text-stone-700 mb-2">交通情報</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={schedule.transport.method}
            onChange={(e) =>
              onScheduleChange({
                ...schedule,
                transport: { ...schedule.transport, method: e.target.value },
              })
            }
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
          >
            <option value="">交通手段を選択</option>
            <option value="徒歩">徒歩</option>
            <option value="電車">電車</option>
            <option value="タクシー">タクシー</option>
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
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-base"
          />
        </div>
      </div>
    </div>
  );
}
