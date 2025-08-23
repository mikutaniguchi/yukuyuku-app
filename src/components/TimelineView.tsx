'use client';

import React from 'react';
import { Edit2 } from 'lucide-react';
import { Schedule } from '@/types';
import { getIcon, getIconOption } from '@/lib/constants';
interface TimelineViewProps {
  schedules: Schedule[];
  onEditClick: (schedule: Schedule) => void;
  canEdit?: boolean;
}

export default function TimelineView({
  schedules,
  onEditClick,
  canEdit = true,
}: TimelineViewProps) {
  // スケジュールを時間順にソート
  const sortedSchedules = [...schedules].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // 基本の時間軸は6:00-23:00
  const baseStartHour = 6;
  const baseEndHour = 23;

  // 時間軸の生成（6:00-23:00固定）
  const timeSlots = Array.from(
    { length: baseEndHour - baseStartHour + 1 },
    (_, i) => {
      const hour = i + baseStartHour;
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  );

  return (
    <div className="relative">
      {/* スケジュールを時間帯ごとにグループ化 */}
      <div className="space-y-1">
        {/* 6時より前の予定（早朝） */}
        {sortedSchedules.filter(
          (s) => parseInt(s.startTime.split(':')[0]) < baseStartHour
        ).length > 0 && (
          <div className="flex items-start gap-3 min-h-[3rem]">
            <div className="w-16 flex-shrink-0 text-sm font-medium text-stone-500 pt-1">
              早朝
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 space-y-2">
                {sortedSchedules
                  .filter(
                    (s) => parseInt(s.startTime.split(':')[0]) < baseStartHour
                  )
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* アイコン */}
                          {schedule.icon && (
                            <span
                              className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: getIconOption(schedule.icon)
                                  .bgColor,
                                color: getIconOption(schedule.icon).iconColor,
                              }}
                            >
                              {getIcon(schedule.icon)}
                            </span>
                          )}

                          {/* 時間とタイトル */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-600">
                              {schedule.startTime}
                              {schedule.endTime && ` - ${schedule.endTime}`}
                            </span>
                            <span className="text-base font-medium text-stone-800">
                              {schedule.title}
                            </span>
                          </div>
                        </div>

                        {/* 編集ボタン */}
                        {canEdit && (
                          <button
                            onClick={() => onEditClick(schedule)}
                            className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-stone-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 通常の時間軸表示 */}
        {timeSlots.map((time) => {
          const hour = parseInt(time.split(':')[0]);
          // その時間帯に始まる予定を取得（分も考慮）
          const schedulesAtTime = sortedSchedules.filter((s) => {
            const scheduleHour = parseInt(s.startTime.split(':')[0]);
            return scheduleHour === hour;
          });

          return (
            <div key={time} className="flex items-start gap-3 min-h-[3rem]">
              {/* 時間表示 */}
              <div className="w-16 flex-shrink-0 text-sm font-medium text-stone-500 pt-1">
                {time}
              </div>

              {/* 時間線 */}
              <div className="flex-1 relative">
                <div className="absolute top-3 left-0 right-0 border-t border-stone-200"></div>

                {/* この時間のスケジュール */}
                <div className="relative z-10 space-y-2">
                  {schedulesAtTime.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* アイコン */}
                          {schedule.icon && (
                            <span
                              className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: getIconOption(schedule.icon)
                                  .bgColor,
                                color: getIconOption(schedule.icon).iconColor,
                              }}
                            >
                              {getIcon(schedule.icon)}
                            </span>
                          )}

                          {/* 時間とタイトル */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-600">
                              {schedule.startTime}
                              {schedule.endTime && ` - ${schedule.endTime}`}
                            </span>
                            <span className="text-base font-medium text-stone-800">
                              {schedule.title}
                            </span>
                          </div>
                        </div>

                        {/* 編集ボタン */}
                        {canEdit && (
                          <button
                            onClick={() => onEditClick(schedule)}
                            className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-stone-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* 23時より後の予定（深夜） */}
        {sortedSchedules.filter(
          (s) => parseInt(s.startTime.split(':')[0]) > baseEndHour
        ).length > 0 && (
          <div className="flex items-start gap-3 min-h-[3rem]">
            <div className="w-16 flex-shrink-0 text-sm font-medium text-stone-500 pt-1">
              深夜
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 space-y-2">
                {sortedSchedules
                  .filter(
                    (s) => parseInt(s.startTime.split(':')[0]) > baseEndHour
                  )
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* アイコン */}
                          {schedule.icon && (
                            <span
                              className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: getIconOption(schedule.icon)
                                  .bgColor,
                                color: getIconOption(schedule.icon).iconColor,
                              }}
                            >
                              {getIcon(schedule.icon)}
                            </span>
                          )}

                          {/* 時間とタイトル */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-600">
                              {schedule.startTime}
                              {schedule.endTime && ` - ${schedule.endTime}`}
                            </span>
                            <span className="text-base font-medium text-stone-800">
                              {schedule.title}
                            </span>
                          </div>
                        </div>

                        {/* 編集ボタン */}
                        {canEdit && (
                          <button
                            onClick={() => onEditClick(schedule)}
                            className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-stone-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 予定がない時間帯のスタイル（印刷用） */}
      <style jsx>{`
        @media print {
          .timeline-view {
            page-break-inside: avoid;
          }

          .timeline-hour {
            min-height: 2rem;
            border-left: 2px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}
