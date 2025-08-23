'use client';

import { useState } from 'react';
import { Trip, Schedule } from '@/types';
import { processAndUploadFile, deleteFileFromStorage } from '@/lib/fileStorage';

interface UseFileUploadReturn {
  uploadingFiles: Set<string>;
  expandedSchedules: Set<string>;
  handleFileUpload: (scheduleId: string) => Promise<void>;
  handleFilesUpload: (scheduleId: string, files: File[]) => Promise<void>;
  handleFileDelete: (
    scheduleId: string,
    fileId: string | number
  ) => Promise<void>;
  onToggleExpand: (scheduleId: string) => void;
  createFileInput: () => HTMLInputElement;
}

interface UseFileUploadProps {
  trip: Trip;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
  editingSchedule?: Schedule | null;
  setEditingSchedule?: (schedule: Schedule | null) => void;
}

/**
 * ファイルアップロード機能を管理するカスタムフック
 */
export function useFileUpload({
  trip,
  onTripUpdate,
  editingSchedule,
  setEditingSchedule,
}: UseFileUploadProps): UseFileUploadReturn {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(
    new Set()
  );

  const createFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf,.heic,.HEIC';
    input.multiple = true;
    return input;
  };

  const handleFileUpload = async (scheduleId: string) => {
    const input = createFileInput();
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      await handleFilesUpload(scheduleId, Array.from(files));
    };
    input.click();
  };

  const handleFilesUpload = async (scheduleId: string, files: File[]) => {
    if (files.length === 0) return;

    // アップロード開始
    setUploadingFiles((prev) => new Set([...prev, scheduleId]));

    try {
      const uploadPromises = files.map(async (file) => {
        return await processAndUploadFile(file, trip.id, scheduleId);
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      onTripUpdate(trip.id, (currentTrip) => {
        const updatedSchedules = { ...currentTrip.schedules };
        let updatedSchedule: Schedule | null = null;

        // 全ての日付からスケジュールを探して更新
        for (const [date, schedules] of Object.entries(updatedSchedules)) {
          const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);
          if (scheduleIndex !== -1) {
            updatedSchedules[date] = schedules.map((schedule) =>
              schedule.id === scheduleId
                ? {
                    ...schedule,
                    files: [...schedule.files, ...uploadedFiles],
                  }
                : schedule
            );
            // 更新されたスケジュールを保存
            updatedSchedule =
              updatedSchedules[date].find((s) => s.id === scheduleId) || null;
            break;
          }
        }

        // 編集中のスケジュールが更新対象と同じ場合、状態も更新
        if (
          editingSchedule?.id === scheduleId &&
          updatedSchedule &&
          setEditingSchedule
        ) {
          setEditingSchedule(updatedSchedule);
        }

        return { ...currentTrip, schedules: updatedSchedules };
      });
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      alert(
        `ファイルのアップロードに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      // アップロード完了
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  const handleFileDelete = async (
    scheduleId: string,
    fileId: string | number
  ) => {
    // 削除対象のファイル情報を取得
    let schedule: Schedule | undefined;
    for (const schedules of Object.values(trip.schedules)) {
      schedule = schedules.find((s) => s.id === scheduleId);
      if (schedule) break;
    }

    const fileToDelete = schedule?.files.find((f) => f.id === fileId);

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
    onTripUpdate(trip.id, (currentTrip) => {
      const updatedSchedules = { ...currentTrip.schedules };
      let updatedSchedule: Schedule | null = null;

      // 全ての日付からスケジュールを探して更新
      for (const [date, schedules] of Object.entries(updatedSchedules)) {
        const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);
        if (scheduleIndex !== -1) {
          updatedSchedules[date] = schedules.map((schedule) =>
            schedule.id === scheduleId
              ? {
                  ...schedule,
                  files: schedule.files.filter((file) => file.id !== fileId),
                }
              : schedule
          );
          // 更新されたスケジュールを保存
          updatedSchedule =
            updatedSchedules[date].find((s) => s.id === scheduleId) || null;
          break;
        }
      }

      // 編集中のスケジュールが更新対象と同じ場合、状態も更新
      if (
        editingSchedule?.id === scheduleId &&
        updatedSchedule &&
        setEditingSchedule
      ) {
        setEditingSchedule(updatedSchedule);
      }

      return { ...currentTrip, schedules: updatedSchedules };
    });
  };

  const onToggleExpand = (scheduleId: string) => {
    setExpandedSchedules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  return {
    uploadingFiles,
    expandedSchedules,
    handleFileUpload,
    handleFilesUpload,
    handleFileDelete,
    onToggleExpand,
    createFileInput,
  };
}
