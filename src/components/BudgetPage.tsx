'use client';

import React, { useMemo } from 'react';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { Trip } from '@/types';
import { getDatesInRange, formatDate, colorPalette } from '@/lib/constants';
import SummaryCard from './SummaryCard';
import Card from './Card';

interface BudgetPageProps {
  trip: Trip;
}

export default function BudgetPage({ trip }: BudgetPageProps) {
  const tripDates = getDatesInRange(trip.startDate, trip.endDate);

  const calculateTotalBudget = useMemo(() => {
    let total = 0;
    Object.values(trip.schedules).forEach((daySchedules) => {
      daySchedules.forEach((schedule) => {
        const budgetPerPerson =
          schedule.budgetPeople > 0
            ? (schedule.budget || 0) / schedule.budgetPeople
            : 0;
        total += budgetPerPerson + (schedule.transport?.cost || 0);
      });
    });
    return total;
  }, [trip.schedules]);

  const calculateDayBudget = useMemo(() => {
    const budgetByDate: Record<string, number> = {};
    Object.entries(trip.schedules).forEach(([date, daySchedules]) => {
      budgetByDate[date] = daySchedules.reduce(
        (sum, schedule) =>
          sum +
          (schedule.budgetPeople > 0
            ? Math.round((schedule.budget || 0) / schedule.budgetPeople)
            : 0) +
          (schedule.transport?.cost || 0),
        0
      );
    });
    return (date: string) => budgetByDate[date] || 0;
  }, [trip.schedules]);

  const calculateAdvancePayments = useMemo(() => {
    const advances: Record<
      string,
      {
        memberId: string;
        memberName: string;
        totalAdvanced: number;
        perPersonPayment: number;
      }
    > = {};

    Object.values(trip.schedules).forEach((daySchedules) => {
      daySchedules.forEach((schedule) => {
        if (schedule.paidBy && schedule.budget > 0) {
          const member = trip.members.find((m) => m.id === schedule.paidBy);
          if (member) {
            if (!advances[schedule.paidBy]) {
              advances[schedule.paidBy] = {
                memberId: schedule.paidBy,
                memberName: member.name,
                totalAdvanced: 0,
                perPersonPayment: 0,
              };
            }
            advances[schedule.paidBy].totalAdvanced += schedule.budget;
            // 各スケジュールのbudgetPeopleを使って一人あたりの支払い額を計算
            advances[schedule.paidBy].perPersonPayment += Math.round(
              schedule.budget / schedule.budgetPeople
            );
          }
        }
      });
    });

    return Object.values(advances);
  }, [trip.schedules, trip.members]);

  const totalBudget = calculateTotalBudget;
  const averageDailyBudget = useMemo(
    () =>
      tripDates.length > 0 ? Math.round(totalBudget / tripDates.length) : 0,
    [totalBudget, tripDates.length]
  );
  const advancePayments = calculateAdvancePayments;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-stone-800">予算管理</h2>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={DollarSign}
          title="1人あたり総予算"
          value={`¥${Math.round(totalBudget).toLocaleString()}`}
          colorKey="strawBeige"
        />

        <SummaryCard
          icon={Users}
          title="参加者数"
          value={`${trip.members.length}人`}
          colorKey="aquaBlue"
        />

        <SummaryCard
          icon={Calendar}
          title="日平均予算"
          value={`¥${averageDailyBudget.toLocaleString()}`}
          colorKey="roseQuartz"
        />

        <SummaryCard
          icon={TrendingUp}
          title="総額（全員分）"
          value={`¥${Math.round(totalBudget * trip.members.length).toLocaleString()}`}
          colorKey="abyssGreen"
        />
      </div>

      {/* 日別予算詳細 */}
      <Card>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          日別予算詳細（1人あたり）
        </h3>
        <div className="space-y-4">
          {tripDates.map((date) => {
            const daySchedules = trip.schedules[date] || [];
            const dayTotal = calculateDayBudget(date);

            if (dayTotal === 0) {
              return (
                <div
                  key={date}
                  className="border border-stone-200 rounded-lg p-4 opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-stone-600">
                      {formatDate(date)}
                    </h4>
                    <span className="text-stone-500">予算なし</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={date}
                className="border border-stone-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-stone-800">
                    {formatDate(date)}
                  </h4>
                  <span
                    className="text-lg font-bold"
                    style={{ color: colorPalette.strawBeige.bg }}
                  >
                    ¥{dayTotal.toLocaleString()}/人
                  </span>
                </div>
                <div className="space-y-2">
                  {daySchedules.map((schedule, scheduleIndex) => {
                    const budgetPerPerson =
                      schedule.budgetPeople > 0
                        ? Math.round(
                            (schedule.budget || 0) / schedule.budgetPeople
                          )
                        : 0;
                    const scheduleTotal =
                      budgetPerPerson + (schedule.transport?.cost || 0);
                    if (scheduleTotal === 0) return null;

                    return (
                      <div
                        key={`${date}-${schedule.id}-${scheduleIndex}`}
                        className="flex items-center justify-between text-sm bg-stone-50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-600">
                            {schedule.startTime}
                          </span>
                          <span className="text-stone-700">
                            {schedule.title}
                          </span>
                          <div className="text-xs text-stone-500">
                            {schedule.budget > 0 &&
                              `(¥${schedule.budget}÷${schedule.budgetPeople}人)`}
                            {schedule.transport?.cost > 0 &&
                              ` + 交通費¥${schedule.transport.cost}`}
                          </div>
                        </div>
                        <span className="font-medium text-stone-800">
                          ¥{scheduleTotal.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 立て替え集計 */}
      {advancePayments.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            立て替え集計
          </h3>
          <div className="space-y-4">
            {advancePayments.map((advance) => (
              <div
                key={advance.memberId}
                className="border border-stone-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-stone-800">
                    {advance.memberName}
                  </h4>
                  <span
                    className="text-lg font-bold"
                    style={{ color: colorPalette.sandRed.bg }}
                  >
                    立て替え合計: ¥{advance.totalAdvanced.toLocaleString()}
                  </span>
                </div>
                <div className="bg-stone-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-600">
                      {advance.memberName}に払う（1人あたり）
                    </span>
                    <span className="font-bold text-stone-800">
                      ¥{advance.perPersonPayment.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 予算がない場合のメッセージ */}
      {totalBudget === 0 && (
        <div className="text-center py-12 text-stone-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-stone-300" />
          <p className="text-lg font-medium mb-2">
            まだ予算が設定されていません
          </p>
          <p className="text-sm">
            スケジュールページで各イベントに予算を追加してください
          </p>
        </div>
      )}
    </div>
  );
}
