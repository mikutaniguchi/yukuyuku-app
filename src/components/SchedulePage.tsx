'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, Plus, MapPin, Edit2, Trash2, Save, X, Upload, FileText, Car, ExternalLink, DollarSign, ChevronDown, ChevronUp, Utensils, Plane, TrainFront, Bus, Camera, Bed } from 'lucide-react';
import { Trip, Schedule, UploadedFile, ScheduleFormData } from '@/types';
import { colorPalette, getDatesInRange, formatDate, linkifyText, getGoogleMapsLink, getIcon } from '@/lib/constants';
import ScheduleForm from './ScheduleForm';
import { processAndUploadFile, deleteFileFromStorage } from '@/lib/fileStorage';
import NewScheduleModal from './NewScheduleModal';
import ImageModal from './ImageModal';
import PDFModal from './PDFModal';

interface SchedulePageProps {
  trip: Trip;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
}

export default function SchedulePage({ trip, selectedDate, onDateChange, onTripUpdate }: SchedulePageProps) {
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [editingScheduleData, setEditingScheduleData] = useState<ScheduleFormData | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  
  // ユニークIDを生成する関数
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 11);
    const counter = Math.floor(Math.random() * 10000); // 追加のランダム要素
    return `schedule_${timestamp}_${randomPart}_${counter}`;
  };

  const handleNewScheduleClick = (date?: string) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const currentTime = `${hours}:00`;
    
    setNewSchedule({
      date: date || selectedDate,
      startTime: currentTime,
      endTime: undefined,
      title: "",
      location: "",
      description: "",
      icon: "",
      budget: 0,
      budgetPeople: 1,
      paidBy: "",
      transport: { method: "", duration: "", cost: 0 }
    });
    setShowNewScheduleModal(true);
  };

  const [newSchedule, setNewSchedule] = useState<ScheduleFormData>({
    date: selectedDate,
    startTime: "12:00", // 固定値に変更
    endTime: undefined,
    title: "",
    location: "",
    description: "",
    icon: "",
    budget: 0,
    budgetPeople: 1,
    paidBy: "",
    transport: { method: "", duration: "", cost: 0 }
  });

  const createFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.heic';
    return input;
  };

  const tripDates = getDatesInRange(trip.startDate, trip.endDate);

  // スクロール時に現在の日付を検出
  useEffect(() => {
    const handleScroll = () => {
      const dateElements = tripDates.map(date => ({
        date,
        element: document.getElementById(`schedule-${date}`)
      }));
      
      // ビューポート内の要素を検出
      for (const { date, element } of dateElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            onDateChange(date);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tripDates, onDateChange]);

  const toggleScheduleExpansion = (scheduleId: string) => {
    const newExpanded = new Set(expandedSchedules);
    if (newExpanded.has(scheduleId)) {
      newExpanded.delete(scheduleId);
    } else {
      newExpanded.add(scheduleId);
    }
    setExpandedSchedules(newExpanded);
  };

  const handleEditScheduleChange = (scheduleId: string, scheduleData: ScheduleFormData) => {
    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      
      // 全ての日付からスケジュールを探す
      let originalSchedule = null;
      let originalDate = null;
      
      for (const [date, schedules] of Object.entries(updatedSchedules)) {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule) {
          originalSchedule = schedule;
          originalDate = date;
          break;
        }
      }
      
      if (!originalSchedule || !originalDate) return currentTrip;
      
      // 日付が変更された場合の処理
      if (scheduleData.date !== originalDate) {
        // 元の日付からスケジュールを削除
        updatedSchedules[originalDate] = updatedSchedules[originalDate].filter(s => s.id !== scheduleId);
        
        // 新しい日付にスケジュールを追加
        if (!updatedSchedules[scheduleData.date]) {
          updatedSchedules[scheduleData.date] = [];
        }
        updatedSchedules[scheduleData.date].push({ 
          ...originalSchedule, 
          date: scheduleData.date,
          startTime: scheduleData.startTime,
          ...(scheduleData.endTime && { endTime: scheduleData.endTime }),
          title: scheduleData.title,
          location: scheduleData.location,
          description: scheduleData.description,
          icon: scheduleData.icon,
          budget: scheduleData.budget,
          budgetPeople: scheduleData.budgetPeople,
          paidBy: scheduleData.paidBy,
          transport: scheduleData.transport
        });
      } else {
        // 同じ日付内での変更
        updatedSchedules[originalDate] = updatedSchedules[originalDate].map(s => 
          s.id === scheduleId ? { 
            ...s, 
            date: scheduleData.date,
            startTime: scheduleData.startTime,
            ...(scheduleData.endTime && { endTime: scheduleData.endTime }),
            title: scheduleData.title,
            location: scheduleData.location,
            description: scheduleData.description,
            icon: scheduleData.icon,
            budget: scheduleData.budget,
            budgetPeople: scheduleData.budgetPeople,
            paidBy: scheduleData.paidBy,
            transport: scheduleData.transport
          } : s
        );
      }
      
      return { ...currentTrip, schedules: updatedSchedules };
    });
  };

  const isImageFile = (file: UploadedFile) => {
    return file.type && file.type.startsWith('image/');
  };

  const isPDFFile = (file: UploadedFile) => {
    return file.type === 'application/pdf';
  };


  const iconOptions = [
    { id: '', name: 'なし', bgColor: colorPalette.strawBeige.light, iconColor: colorPalette.strawBeige.lightText },
    { id: 'meal', name: '食事', bgColor: colorPalette.sandRed.light, iconColor: colorPalette.sandRed.lightText },
    { id: 'car', name: '車', bgColor: colorPalette.aquaBlue.light, iconColor: colorPalette.aquaBlue.lightText },
    { id: 'plane', name: '飛行機', bgColor: colorPalette.aquaBlue.light, iconColor: colorPalette.aquaBlue.lightText },
    { id: 'train', name: '電車', bgColor: colorPalette.aquaBlue.light, iconColor: colorPalette.aquaBlue.lightText },
    { id: 'bus', name: 'バス', bgColor: colorPalette.aquaBlue.light, iconColor: colorPalette.aquaBlue.lightText },
    { id: 'camera', name: '観光', bgColor: colorPalette.strawBeige.light, iconColor: colorPalette.strawBeige.lightText },
    { id: 'bed', name: '宿泊', bgColor: colorPalette.roseQuartz.light, iconColor: colorPalette.roseQuartz.lightText }
  ];

  const getIconOption = (icon?: string) => {
    return iconOptions.find(option => option.id === (icon || '')) || iconOptions[0];
  };

  const handleFileUpload = async (scheduleId: string) => {
    const input = createFileInput();
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      // アップロード開始
      setUploadingFiles(prev => new Set([...prev, scheduleId]));

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          return await processAndUploadFile(file, trip.id, scheduleId);
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        onTripUpdate(trip.id, currentTrip => {
          const updatedSchedules = { ...currentTrip.schedules };
          updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(schedule => 
            schedule.id === scheduleId 
              ? { ...schedule, files: [...schedule.files, ...uploadedFiles] }
              : schedule
          );
          return { ...currentTrip, schedules: updatedSchedules };
        });
      } catch (error) {
        console.error('ファイルアップロードエラー:', error);
        alert(`ファイルのアップロードに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        // アップロード完了
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });
      }
    };
    input.click();
  };

  const handleFileDelete = async (scheduleId: string, fileId: string | number) => {
    // 削除対象のファイル情報を取得
    const schedule = trip.schedules[selectedDate]?.find(s => s.id === scheduleId);
    const fileToDelete = schedule?.files.find(f => f.id === fileId);
    
    if (fileToDelete?.fullPath) {
      try {
        // Firebase Storageから削除
        await deleteFileFromStorage(fileToDelete.fullPath);
      } catch (error) {
        console.error('Storage削除エラー:', error);
        // Storage削除に失敗してもUI上では削除を続行
      }
    }

    // UIから削除
    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      updatedSchedules[selectedDate] = updatedSchedules[selectedDate].map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, files: schedule.files.filter(file => file.id !== fileId) }
          : schedule
      );
      return { ...currentTrip, schedules: updatedSchedules };
    });
  };

  const addNewSchedule = () => {
    if (!newSchedule.title || !newSchedule.startTime) return;

    const scheduleItem: Schedule = {
      id: generateUniqueId(),
      tripId: trip.id.toString(),
      date: newSchedule.date,
      startTime: newSchedule.startTime,
      ...(newSchedule.endTime && { endTime: newSchedule.endTime }),
      title: newSchedule.title,
      location: newSchedule.location,
      description: newSchedule.description,
      ...(newSchedule.icon && { icon: newSchedule.icon }),
      budget: newSchedule.budget,
      budgetPeople: newSchedule.budgetPeople,
      ...(newSchedule.paidBy && { paidBy: newSchedule.paidBy }),
      transport: newSchedule.transport,
      files: []
    };

    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      if (!updatedSchedules[newSchedule.date]) {
        updatedSchedules[newSchedule.date] = [];
      }
      updatedSchedules[newSchedule.date] = [...updatedSchedules[newSchedule.date], scheduleItem];
      return { ...currentTrip, schedules: updatedSchedules };
    });

    setNewSchedule({
      date: selectedDate,
      startTime: "",
      endTime: undefined,
      title: "",
      location: "",
      description: "",
      icon: "",
      budget: 0,
      budgetPeople: 1,
      paidBy: "",
      transport: { method: "", duration: "", cost: 0 }
    });
    setShowNewScheduleModal(false);
    // selectedDateは変更しない（現在の日付を維持）
  };

  const deleteSchedule = (scheduleId: string) => {
    onTripUpdate(trip.id, currentTrip => {
      const updatedSchedules = { ...currentTrip.schedules };
      updatedSchedules[selectedDate] = updatedSchedules[selectedDate].filter(s => s.id !== scheduleId);
      return { ...currentTrip, schedules: updatedSchedules };
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr] gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 md:w-fit md:h-fit md:sticky md:top-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">日程</h2>
          <div className="space-y-2">
            {tripDates.map(date => (
              <a
                key={date}
                href={`#schedule-${date}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(`schedule-${date}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  onDateChange(date);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors font-medium whitespace-nowrap ${
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
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {tripDates.map(date => {
            const daySchedules = (trip.schedules[date] || []).sort((a, b) => {
              return a.startTime.localeCompare(b.startTime);
            });
            return (
              <div 
                key={date} 
                id={`schedule-${date}`}
                className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 scroll-mt-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-stone-800">
                    {formatDate(date)}
                  </h2>
                  <button
                    onClick={() => {
                      onDateChange(date);
                      handleNewScheduleClick(date);
                    }}
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
                        {daySchedules.map((schedule, index) => (
                    <div key={`${schedule.id}-${index}-${schedule.startTime}`} className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {editingSchedule === schedule.id ? (
                  <div className="space-y-3">
                    <ScheduleForm
                      schedule={editingScheduleData || {
                        date: schedule.date,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        title: schedule.title,
                        location: schedule.location,
                        description: schedule.description,
                        icon: schedule.icon || '',
                        budget: schedule.budget || 0,
                        budgetPeople: schedule.budgetPeople || 1,
                        paidBy: schedule.paidBy || '',
                        transport: schedule.transport || { method: '', duration: '', cost: 0 }
                      }}
                      onScheduleChange={(scheduleData) => setEditingScheduleData(scheduleData)}
                      tripMembers={trip.members}
                      tripDates={tripDates}
                      iconOptions={iconOptions}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (editingScheduleData) {
                            handleEditScheduleChange(schedule.id, editingScheduleData);
                            // 日付が変更された場合、その日付に移動
                            if (editingScheduleData.date !== selectedDate) {
                              onDateChange(editingScheduleData.date);
                            }
                          }
                          setEditingSchedule(null);
                          setEditingScheduleData(null);
                        }}
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
                        onClick={() => {
                          setEditingSchedule(null);
                          setEditingScheduleData(null);
                        }}
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
                        <span className="text-lg font-semibold" style={{ color: colorPalette.abyssGreen.bg }}>
                          {schedule.startTime}
                        </span>
                        {schedule.icon && (
                          <span 
                            className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1"
                            style={{ 
                              backgroundColor: getIconOption(schedule.icon).bgColor, 
                              color: getIconOption(schedule.icon).iconColor 
                            }}
                          >
                            {getIcon(schedule.icon)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSchedule(schedule.id);
                            setEditingScheduleData({
                              date: schedule.date,
                              startTime: schedule.startTime,
                              endTime: schedule.endTime,
                              title: schedule.title,
                              location: schedule.location,
                              description: schedule.description,
                              icon: schedule.icon || '',
                              budget: schedule.budget || 0,
                              budgetPeople: schedule.budgetPeople || 1,
                              paidBy: schedule.paidBy || '',
                              transport: schedule.transport || { method: '', duration: '', cost: 0 }
                            });
                          }}
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
                      <div className="mb-2">
                        <a
                          href={getGoogleMapsLink(schedule.location) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-600 hover:text-stone-800 underline inline-flex items-center gap-1"
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {schedule.location}
                        </a>
                      </div>
                    )}
                    {schedule.description && (
                      <div className="text-stone-700 mb-3 whitespace-pre-wrap break-words">
                        {linkifyText(schedule.description)}
                      </div>
                    )}


                    {(schedule.transport?.method || schedule.transport?.duration) && (
                      <div className="bg-stone-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Car className="w-4 h-4" />
                          <span className="font-medium">交通情報:</span>
                          {schedule.transport.method && <span>{schedule.transport.method}</span>}
                          {schedule.transport.duration && <span>({schedule.transport.duration})</span>}
                        </div>
                      </div>
                    )}

                    {schedule.files && schedule.files.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {schedule.files.slice(0, expandedSchedules.has(schedule.id) ? undefined : 6).map(file => (
                            <div key={file.id} className="group relative">
                              {isImageFile(file) ? (
                                <div className="relative">
                                  <div className="relative w-full h-20 cursor-pointer" onClick={() => setShowImageModal(file.url)}>
                                    <Image 
                                      src={file.url} 
                                      alt={file.name}
                                      fill
                                      unoptimized
                                      className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                                    />
                                  </div>
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    {file.name.length > 10 ? `${file.name.substring(0, 10)}...` : file.name}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFileDelete(schedule.id, file.id);
                                    }}
                                    className="absolute top-1 right-1 bg-stone-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <div 
                                    className="flex items-center gap-2 p-2 bg-stone-100 rounded-lg hover:bg-stone-200 cursor-pointer transition-colors"
                                    onClick={() => isPDFFile(file) ? setShowPDFModal(file.url) : undefined}
                                  >
                                    <FileText className="w-4 h-4 text-stone-600" />
                                    <span className="text-sm text-stone-700 truncate">
                                      {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFileDelete(schedule.id, file.id);
                                    }}
                                    className="absolute top-1 right-1 bg-stone-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
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

                    <button
                      onClick={() => handleFileUpload(schedule.id)}
                      disabled={uploadingFiles.has(schedule.id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingFiles.has(schedule.id) ? 'アップロード中...' : 'ファイル追加'}
                          </button>
                      </>
                    )}
                  </div>
                ))}

                  {daySchedules.length === 0 && (
                    <div className="text-center py-12 text-stone-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                      <p>この日のスケジュールはまだありません</p>
                      <button
                        onClick={() => {
                          onDateChange(date);
                          handleNewScheduleClick(date);
                        }}
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
            );
          })}
        </div>
      </div>

      <ImageModal
        isOpen={!!showImageModal}
        imageUrl={showImageModal}
        onClose={() => setShowImageModal(null)}
      />

      <PDFModal
        isOpen={!!showPDFModal}
        pdfUrl={showPDFModal}
        onClose={() => setShowPDFModal(null)}
      />

      <NewScheduleModal
        isOpen={showNewScheduleModal}
        onClose={() => setShowNewScheduleModal(false)}
        newSchedule={newSchedule}
        onScheduleChange={setNewSchedule}
        onSubmit={addNewSchedule}
        tripMembers={trip.members}
        tripDates={tripDates}
        iconOptions={iconOptions}
      />
    </>
  );
}