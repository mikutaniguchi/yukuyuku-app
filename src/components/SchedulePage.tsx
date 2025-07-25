'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Calendar, Plus, MapPin, Users, Clock, Edit2, Trash2, Save, X, Upload, FileText, Car, ExternalLink, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Trip, Schedule, UploadedFile } from '@/types';
import { colorPalette, getDatesInRange, formatDate, linkifyText, getGoogleMapsLink } from '@/lib/constants';

interface SchedulePageProps {
  trip: Trip;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onTripUpdate: (tripId: number, updateFunction: (trip: Trip) => Trip) => void;
}

export default function SchedulePage({ trip, selectedDate, onDateChange, onTripUpdate }: SchedulePageProps) {
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<number>>(new Set());
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    time: "",
    title: "",
    location: "",
    description: "",
    type: "meeting",
    budget: 0,
    budgetPeople: 1,
    transport: { method: "", duration: "", cost: 0 }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tripDates = getDatesInRange(trip.startDate, trip.endDate);
  const currentSchedules = trip.schedules[selectedDate] || [];

  const toggleScheduleExpansion = (scheduleId: number) => {
    const newExpanded = new Set(expandedSchedules);
    if (newExpanded.has(scheduleId)) {
      newExpanded.delete(scheduleId);
    } else {
      newExpanded.add(scheduleId);
    }
    setExpandedSchedules(newExpanded);
  };

  const isImageFile = (file: UploadedFile) => {
    return file.type && file.type.startsWith('image/');
  };

  const isPDFFile = (file: UploadedFile) => {
    return file.type === 'application/pdf';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'sightseeing': return <MapPin className="w-4 h-4" />;
      case 'departure': return <Calendar className="w-4 h-4" />;
      case 'meal': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCustomTag = (type: string) => {
    return trip.customTags.find(tag => tag.id === type) || 
           { name: type, color: "bg-stone-200 text-stone-800" };
  };

  const handleFileUpload = (scheduleId: number, files: FileList | null) => {
    if (!files) return;

    const fileList = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, files: [...schedule.files, ...fileList] }
          : schedule
      );
      return { ...currentTrip, schedules: updatedSchedules };
    });
  };

  const addNewSchedule = () => {
    if (!newSchedule.title || !newSchedule.time) return;

    const scheduleItem: Schedule = {
      id: Date.now(),
      ...newSchedule,
      files: []
    };

    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      updatedSchedules[selectedDate] = [...(updatedSchedules[selectedDate] || []), scheduleItem];
      return { ...currentTrip, schedules: updatedSchedules };
    });

    setNewSchedule({
      time: "",
      title: "",
      location: "",
      description: "",
      type: "meeting",
      budget: 0,
      budgetPeople: 1,
      transport: { method: "", duration: "", cost: 0 }
    });
    setShowNewScheduleModal(false);
    // selectedDateは変更しない（現在の日付を維持）
  };

  const deleteSchedule = (scheduleId: number) => {
    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      updatedSchedules[selectedDate] = updatedSchedules[selectedDate].filter(s => s.id !== scheduleId);
      return { ...currentTrip, schedules: updatedSchedules };
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">日程</h2>
          <div className="space-y-2">
            {tripDates.map(date => (
              <button
                key={date}
                onClick={() => onDateChange(date)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium ${
                  selectedDate === date
                    ? 'text-white shadow-sm'
                    : 'hover:bg-stone-100 text-stone-700'
                }`}
                style={selectedDate === date ? {
                  backgroundColor: colorPalette.abyssGreen.bg,
                  color: colorPalette.abyssGreen.text
                } : {}}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-stone-800">
              {formatDate(selectedDate)}のスケジュール
            </h2>
            <button
              onClick={() => setShowNewScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors font-medium hover:shadow-md"
              style={{ 
                backgroundColor: colorPalette.abyssGreen.bg,
                color: colorPalette.abyssGreen.text 
              }}
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          <div className="space-y-4">
            {currentSchedules.map(schedule => (
              <div key={schedule.id} className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {editingSchedule === schedule.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => {
                          const updatedSchedule = { ...schedule, time: e.target.value };
                          onTripUpdate(trip.id, currentTrip => {
                            const updatedSchedules = { ...currentTrip.schedules };
                            updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                              s.id === schedule.id ? updatedSchedule : s
                            );
                            return { ...currentTrip, schedules: updatedSchedules };
                          });
                        }}
                        className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={schedule.type}
                        onChange={(e) => {
                          const updatedSchedule = { ...schedule, type: e.target.value };
                          onTripUpdate(trip.id, currentTrip => {
                            const updatedSchedules = { ...currentTrip.schedules };
                            updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                              s.id === schedule.id ? updatedSchedule : s
                            );
                            return { ...currentTrip, schedules: updatedSchedules };
                          });
                        }}
                        className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {trip.customTags.map(tag => (
                          <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="タイトル"
                      value={schedule.title}
                      onChange={(e) => {
                        const updatedSchedule = { ...schedule, title: e.target.value };
                        onTripUpdate(trip.id, currentTrip => {
                          const updatedSchedules = { ...currentTrip.schedules };
                          updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                            s.id === schedule.id ? updatedSchedule : s
                          );
                          return { ...currentTrip, schedules: updatedSchedules };
                        });
                      }}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="場所"
                      value={schedule.location}
                      onChange={(e) => {
                        const updatedSchedule = { ...schedule, location: e.target.value };
                        onTripUpdate(trip.id, currentTrip => {
                          const updatedSchedules = { ...currentTrip.schedules };
                          updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                            s.id === schedule.id ? updatedSchedule : s
                          );
                          return { ...currentTrip, schedules: updatedSchedules };
                        });
                      }}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <textarea
                      placeholder="詳細・メモ（URLも自動でリンクになります）"
                      value={schedule.description}
                      onChange={(e) => {
                        const updatedSchedule = { ...schedule, description: e.target.value };
                        onTripUpdate(trip.id, currentTrip => {
                          const updatedSchedules = { ...currentTrip.schedules };
                          updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                            s.id === schedule.id ? updatedSchedule : s
                          );
                          return { ...currentTrip, schedules: updatedSchedules };
                        });
                      }}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">¥</span>
                        <input
                          type="number"
                          placeholder="例: 3000"
                          value={schedule.budget}
                          onChange={(e) => {
                            const updatedSchedule = { ...schedule, budget: parseInt(e.target.value) || 0 };
                            onTripUpdate(trip.id, currentTrip => {
                              const updatedSchedules = { ...currentTrip.schedules };
                              updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                                s.id === schedule.id ? updatedSchedule : s
                              );
                              return { ...currentTrip, schedules: updatedSchedules };
                            });
                          }}
                          className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="例: 3"
                          value={schedule.budgetPeople}
                          onChange={(e) => {
                            const updatedSchedule = { ...schedule, budgetPeople: parseInt(e.target.value) || 1 };
                            onTripUpdate(trip.id, currentTrip => {
                              const updatedSchedules = { ...currentTrip.schedules };
                              updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                                s.id === schedule.id ? updatedSchedule : s
                              );
                              return { ...currentTrip, schedules: updatedSchedules };
                            });
                          }}
                          className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500">人</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-stone-700 mb-2">交通情報</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="例: 電車"
                          value={schedule.transport?.method || ""}
                          onChange={(e) => {
                            const updatedSchedule = { 
                              ...schedule, 
                              transport: { ...schedule.transport, method: e.target.value }
                            };
                            onTripUpdate(trip.id, currentTrip => {
                              const updatedSchedules = { ...currentTrip.schedules };
                              updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                                s.id === schedule.id ? updatedSchedule : s
                              );
                              return { ...currentTrip, schedules: updatedSchedules };
                            });
                          }}
                          className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="例: 30分"
                          value={schedule.transport?.duration || ""}
                          onChange={(e) => {
                            const updatedSchedule = { 
                              ...schedule, 
                              transport: { ...schedule.transport, duration: e.target.value }
                            };
                            onTripUpdate(trip.id, currentTrip => {
                              const updatedSchedules = { ...currentTrip.schedules };
                              updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(s => 
                                s.id === schedule.id ? updatedSchedule : s
                              );
                              return { ...currentTrip, schedules: updatedSchedules };
                            });
                          }}
                          className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSchedule(null)}
                        className="flex items-center gap-1 px-3 py-1 text-white rounded-lg transition-colors font-medium"
                        style={{ 
                          backgroundColor: colorPalette.abyssGreen.bg,
                          color: colorPalette.abyssGreen.text
                        }}
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={() => setEditingSchedule(null)}
                        className="flex items-center gap-1 px-3 py-1 text-white rounded-lg transition-colors font-medium"
                        style={{ 
                          backgroundColor: colorPalette.sandRed.bg,
                          color: colorPalette.sandRed.text
                        }}
                      >
                        <X className="w-4 h-4" />
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold" style={{ color: colorPalette.aquaBlue.bg }}>
                          {schedule.time}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCustomTag(schedule.type).color}`}>
                          {getTypeIcon(schedule.type)}
                          {getCustomTag(schedule.type).name}
                        </span>
                        {(schedule.budget > 0 || schedule.transport?.cost > 0) && (
                          <span className="text-xs text-stone-500">
                            ¥{(schedule.budgetPeople > 0 ? Math.round((schedule.budget || 0) / schedule.budgetPeople) : 0) + (schedule.transport?.cost || 0)}/人
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSchedule(schedule.id)}
                          className="p-1 text-stone-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="p-1 text-stone-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-stone-800 mb-1">{schedule.title}</h3>
                    {schedule.location && (
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-stone-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {schedule.location}
                        </p>
                        <a
                          href={getGoogleMapsLink(schedule.location) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          地図
                        </a>
                      </div>
                    )}
                    {schedule.description && (
                      <div className="text-stone-700 mb-3 whitespace-pre-wrap break-words">
                        {linkifyText(schedule.description)}
                      </div>
                    )}

                    {schedule.budget > 0 && (
                      <div className="bg-stone-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">予算:</span>
                          <span>¥{schedule.budget} ({schedule.budgetPeople}人分)</span>
                          <span className="font-semibold">→ 1人あたり¥{schedule.budgetPeople > 0 ? Math.round(schedule.budget / schedule.budgetPeople) : 0}</span>
                        </div>
                      </div>
                    )}

                    {(schedule.transport?.method || schedule.transport?.duration || (schedule.transport?.cost && schedule.transport.cost > 0)) && (
                      <div className="bg-stone-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Car className="w-4 h-4" />
                          <span className="font-medium">交通情報:</span>
                          {schedule.transport.method && <span>{schedule.transport.method}</span>}
                          {schedule.transport.duration && <span>({schedule.transport.duration})</span>}
                          {schedule.transport.cost > 0 && <span>¥{schedule.transport.cost}</span>}
                        </div>
                      </div>
                    )}

                    {schedule.files && schedule.files.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {schedule.files.slice(0, expandedSchedules.has(schedule.id) ? undefined : 6).map(file => (
                            <div key={file.id} className="group">
                              {isImageFile(file) ? (
                                <div className="relative">
                                  <div className="relative w-full h-20 cursor-pointer" onClick={() => setShowImageModal(file.url)}>
                                    <Image 
                                      src={file.url} 
                                      alt={file.name}
                                      fill
                                      className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                                    />
                                  </div>
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    {file.name.length > 10 ? `${file.name.substring(0, 10)}...` : file.name}
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="flex items-center gap-2 p-2 bg-stone-100 rounded-lg hover:bg-stone-200 cursor-pointer transition-colors"
                                  onClick={() => isPDFFile(file) ? setShowPDFModal(file.url) : undefined}
                                >
                                  <FileText className="w-4 h-4 text-stone-600" />
                                  <span className="text-sm text-stone-700 truncate">
                                    {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* アコーディオン機能 */}
                        {schedule.files.length > 6 && (
                          <button
                            onClick={() => toggleScheduleExpansion(schedule.id)}
                            className="mt-2 flex items-center gap-1 text-sm text-stone-600 hover:text-stone-800 transition-colors"
                          >
                            {expandedSchedules.has(schedule.id) ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                ファイルを閉じる
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                {schedule.files.length - 6}件のファイルを表示
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*,.pdf,.heic"
                      onChange={(e) => handleFileUpload(schedule.id, e.target.files)}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      ファイル追加
                    </button>
                  </>
                )}
              </div>
            ))}

            {currentSchedules.length === 0 && (
              <div className="text-center py-12 text-stone-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                <p>この日のスケジュールはまだありません</p>
                <button
                  onClick={() => setShowNewScheduleModal(true)}
                  className="mt-4 px-4 py-2 text-white rounded-lg transition-colors font-medium"
                  style={{ 
                    backgroundColor: colorPalette.abyssGreen.bg,
                    color: colorPalette.abyssGreen.text 
                  }}
                >
                  最初のスケジュールを追加
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-4xl">
            <Image 
              src={showImageModal} 
              alt="拡大表示"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPDFModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPDFModal(null)}
        >
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">PDF プレビュー</h3>
              <button
                onClick={() => setShowPDFModal(null)}
                className="text-stone-500 hover:text-stone-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe 
                src={showPDFModal}
                className="w-full h-full rounded"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* New Schedule Modal */}
      {showNewScheduleModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewScheduleModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-stone-800">スケジュールを追加</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                  className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={newSchedule.type}
                  onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                  className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {trip.customTags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="タイトル"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="場所"
                value={newSchedule.location}
                onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="詳細・メモ"
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500">¥</span>
                  <input
                    type="number"
                    placeholder="例: 3000"
                    value={newSchedule.budget}
                    onChange={(e) => setNewSchedule({ ...newSchedule, budget: parseInt(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="例: 3"
                    value={newSchedule.budgetPeople}
                    onChange={(e) => setNewSchedule({ ...newSchedule, budgetPeople: parseInt(e.target.value) || 1 })}
                    className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500">人</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-stone-700 mb-2">交通情報</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="例: 電車"
                    value={newSchedule.transport.method}
                    onChange={(e) => setNewSchedule({ 
                      ...newSchedule, 
                      transport: { ...newSchedule.transport, method: e.target.value }
                    })}
                    className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="例: 30分"
                    value={newSchedule.transport.duration}
                    onChange={(e) => setNewSchedule({ 
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
                onClick={addNewSchedule}
                className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
                style={{ 
                  backgroundColor: colorPalette.abyssGreen.bg,
                  color: colorPalette.abyssGreen.text 
                }}
              >
                追加
              </button>
              <button
                onClick={() => setShowNewScheduleModal(false)}
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