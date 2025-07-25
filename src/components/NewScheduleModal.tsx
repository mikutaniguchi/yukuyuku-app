'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { colorPalette, getIcon } from '@/lib/constants';
import Modal from './Modal';

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSchedule: {
    time: string;
    title: string;
    location: string;
    description: string;
    icon: string;
    budget: number;
    budgetPeople: number;
    paidBy: string;
    transport: { method: string; duration: string; cost: number };
  };
  onScheduleChange: (schedule: any) => void;
  onSubmit: () => void;
  tripMembers: Array<{ id: string; name: string }>;
  iconOptions: Array<{
    id: string;
    name: string;
    bgColor: string;
    iconColor: string;
  }>;
}

export default function NewScheduleModal({
  isOpen,
  onClose,
  newSchedule,
  onScheduleChange,
  onSubmit,
  tripMembers,
  iconOptions,
}: NewScheduleModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="スケジュールを追加"
      icon={Plus}
      iconColor={colorPalette.abyssGreen.bg}
      maxWidth="md"
    >
      <div className="space-y-4">
        <input
          type="time"
          value={newSchedule.time}
          onChange={(e) => onScheduleChange({ ...newSchedule, time: e.target.value })}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">アイコン</label>
          <div className="flex gap-1">
            {iconOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => onScheduleChange({ ...newSchedule, icon: option.id })}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  newSchedule.icon === option.id 
                    ? 'border-2' 
                    : 'hover:bg-stone-100 border-2 border-transparent'
                }`}
                style={{
                  backgroundColor: newSchedule.icon === option.id ? option.bgColor : 'transparent',
                  color: newSchedule.icon === option.id ? option.iconColor : '#6B7280',
                  borderColor: newSchedule.icon === option.id ? option.iconColor : 'transparent'
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
          value={newSchedule.title}
          onChange={(e) => onScheduleChange({ ...newSchedule, title: e.target.value })}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <input
          type="text"
          placeholder="場所"
          value={newSchedule.location}
          onChange={(e) => onScheduleChange({ ...newSchedule, location: e.target.value })}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <textarea
          placeholder="詳細・メモ"
          value={newSchedule.description}
          onChange={(e) => onScheduleChange({ ...newSchedule, description: e.target.value })}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">¥</span>
            <input
              type="number"
              placeholder="例: 3000"
              value={newSchedule.budget === 0 ? "" : newSchedule.budget}
              onChange={(e) => onScheduleChange({ ...newSchedule, budget: parseInt(e.target.value) || 0 })}
              className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="例: 3"
              value={newSchedule.budgetPeople}
              onChange={(e) => onScheduleChange({ ...newSchedule, budgetPeople: parseInt(e.target.value) || 1 })}
              className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500">人</span>
          </div>
          {newSchedule.budget > 0 && newSchedule.budgetPeople >= 2 ? (
            <select
              value={newSchedule.paidBy}
              onChange={(e) => onScheduleChange({ ...newSchedule, paidBy: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">立て替え中：なし</option>
              {tripMembers.map(member => (
                <option key={member.id} value={member.id}>
                  立て替え中：{member.name}
                </option>
              ))}
            </select>
          ) : (
            <div></div>
          )}
        </div>
        
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-stone-700 mb-2">交通情報</h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="例: 電車"
              value={newSchedule.transport.method}
              onChange={(e) => onScheduleChange({ 
                ...newSchedule, 
                transport: { ...newSchedule.transport, method: e.target.value }
              })}
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <input
              type="text"
              placeholder="例: 30分"
              value={newSchedule.transport.duration}
              onChange={(e) => onScheduleChange({ 
                ...newSchedule, 
                transport: { ...newSchedule.transport, duration: e.target.value }
              })}
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={onSubmit}
          className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
          style={{ 
            backgroundColor: colorPalette.abyssGreen.bg,
            color: colorPalette.abyssGreen.text 
          }}
        >
          追加
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
          style={{ 
            backgroundColor: colorPalette.sandRed.bg,
            color: colorPalette.sandRed.text 
          }}
        >
          キャンセル
        </button>
      </div>
    </Modal>
  );
}