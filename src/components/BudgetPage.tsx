'use client';

import React from 'react';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { Trip } from '@/types';
import { colorPalette, getDatesInRange, formatDate } from '@/lib/constants';

interface BudgetPageProps {
  trip: Trip;
}

export default function BudgetPage({ trip }: BudgetPageProps) {
  const tripDates = getDatesInRange(trip.startDate, trip.endDate);

  const calculateTotalBudget = () => {
    let total = 0;
    Object.values(trip.schedules).forEach(daySchedules => {
      daySchedules.forEach(schedule => {
        const budgetPerPerson = schedule.budgetPeople > 0 ? (schedule.budget || 0) / schedule.budgetPeople : 0;
        total += budgetPerPerson + (schedule.transport?.cost || 0);
      });
    });
    return total;
  };

  const calculateDayBudget = (date: string) => {
    const daySchedules = trip.schedules[date] || [];
    return daySchedules.reduce((sum, schedule) => 
      sum + (schedule.budgetPeople > 0 ? Math.round((schedule.budget || 0) / schedule.budgetPeople) : 0) + (schedule.transport?.cost || 0), 0
    );
  };

  const getBudgetByCategory = () => {
    const categoryBudgets: Record<string, number> = {};
    
    Object.values(trip.schedules).forEach(daySchedules => {
      daySchedules.forEach(schedule => {
        const tag = trip.customTags.find(t => t.id === schedule.type);
        const categoryName = tag?.name || schedule.type;
        const budgetPerPerson = schedule.budgetPeople > 0 ? Math.round((schedule.budget || 0) / schedule.budgetPeople) : 0;
        const transportCost = schedule.transport?.cost || 0;
        
        if (!categoryBudgets[categoryName]) {
          categoryBudgets[categoryName] = 0;
        }
        categoryBudgets[categoryName] += budgetPerPerson + transportCost;
      });
    });
    
    return Object.entries(categoryBudgets).filter(([, amount]) => amount > 0);
  };

  const totalBudget = calculateTotalBudget();
  const categoryBudgets = getBudgetByCategory();
  const averageDailyBudget = tripDates.length > 0 ? Math.round(totalBudget / tripDates.length) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-stone-800">予算管理</h2>
      
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: colorPalette.strawBeige.light }}>
          <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: colorPalette.strawBeige.bg }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: colorPalette.strawBeige.lightText }}>
            1人あたり総予算
          </h3>
          <p className="text-2xl font-bold" style={{ color: colorPalette.strawBeige.bg }}>
            ¥{Math.round(totalBudget).toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: colorPalette.aquaBlue.light }}>
          <Users className="w-8 h-8 mx-auto mb-2" style={{ color: colorPalette.aquaBlue.bg }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: colorPalette.aquaBlue.lightText }}>
            参加者数
          </h3>
          <p className="text-2xl font-bold" style={{ color: colorPalette.aquaBlue.bg }}>
            {trip.members.length}人
          </p>
        </div>

        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: colorPalette.roseQuartz.light }}>
          <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: colorPalette.roseQuartz.bg }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: colorPalette.roseQuartz.lightText }}>
            日平均予算
          </h3>
          <p className="text-2xl font-bold" style={{ color: colorPalette.roseQuartz.bg }}>
            ¥{averageDailyBudget.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: colorPalette.abyssGreen.light }}>
          <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: colorPalette.abyssGreen.bg }} />
          <h3 className="text-sm font-semibold mb-1" style={{ color: colorPalette.abyssGreen.lightText }}>
            総額（全員分）
          </h3>
          <p className="text-2xl font-bold" style={{ color: colorPalette.abyssGreen.bg }}>
            ¥{Math.round(totalBudget * trip.members.length).toLocaleString()}
          </p>
        </div>
      </div>

      {/* カテゴリ別予算 */}
      {categoryBudgets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">カテゴリ別予算（1人あたり）</h3>
          <div className="space-y-3">
            {categoryBudgets
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = totalBudget > 0 ? Math.round((amount / totalBudget) * 100) : 0;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium text-stone-700 min-w-20">{category}</span>
                      <div className="flex-1 bg-stone-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colorPalette.strawBeige.bg
                          }}
                        />
                      </div>
                      <span className="text-sm text-stone-500 min-w-12">{percentage}%</span>
                    </div>
                    <span className="font-bold text-stone-800 min-w-24 text-right">
                      ¥{amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 日別予算詳細 */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">日別予算詳細（1人あたり）</h3>
        <div className="space-y-4">
          {tripDates.map(date => {
            const daySchedules = trip.schedules[date] || [];
            const dayTotal = calculateDayBudget(date);
            
            if (dayTotal === 0) {
              return (
                <div key={date} className="border border-stone-200 rounded-lg p-4 opacity-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-stone-600">{formatDate(date)}</h4>
                    <span className="text-stone-500">予算なし</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={date} className="border border-stone-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-stone-800">{formatDate(date)}</h4>
                  <span className="text-lg font-bold" style={{ color: colorPalette.strawBeige.bg }}>
                    ¥{dayTotal.toLocaleString()}/人
                  </span>
                </div>
                <div className="space-y-2">
                  {daySchedules.map(schedule => {
                    const budgetPerPerson = schedule.budgetPeople > 0 ? Math.round((schedule.budget || 0) / schedule.budgetPeople) : 0;
                    const scheduleTotal = budgetPerPerson + (schedule.transport?.cost || 0);
                    if (scheduleTotal === 0) return null;
                    
                    return (
                      <div key={schedule.id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-600">{schedule.time}</span>
                          <span className="text-stone-700">{schedule.title}</span>
                          <div className="text-xs text-stone-500">
                            {schedule.budget > 0 && `(¥${schedule.budget}÷${schedule.budgetPeople}人)`}
                            {schedule.transport?.cost > 0 && ` + 交通費¥${schedule.transport.cost}`}
                          </div>
                        </div>
                        <span className="font-medium text-stone-800">¥{scheduleTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 予算がない場合のメッセージ */}
      {totalBudget === 0 && (
        <div className="text-center py-12 text-stone-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-stone-300" />
          <p className="text-lg font-medium mb-2">まだ予算が設定されていません</p>
          <p className="text-sm">スケジュールページで各イベントに予算を追加してください</p>
        </div>
      )}
    </div>
  );
}