'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
import { UploadedFile } from '@/types';

interface ScheduleFilesProps {
  files: UploadedFile[];
  scheduleId: string;
  onFileUpload: (scheduleId: string) => void;
  onFileDelete: (scheduleId: string, fileId: string | number) => void;
  uploadingFiles: Set<string>;
  expandedSchedules: Set<string>;
  onToggleExpand: (scheduleId: string) => void;
  onImageClick: (url: string) => void;
  onPDFClick: (url: string) => void;
  onFilesUpload?: (scheduleId: string, files: File[]) => void;
}

export default function ScheduleFiles({
  files,
  scheduleId,
  onFileUpload,
  onFileDelete,
  uploadingFiles,
  expandedSchedules,
  onToggleExpand,
  onImageClick,
  onPDFClick,
  onFilesUpload,
}: ScheduleFilesProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isImageFile = (file: UploadedFile) => {
    return file.type && file.type.startsWith('image/');
  };

  const isPDFFile = (file: UploadedFile) => {
    return file.type === 'application/pdf';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => {
      return (
        file.type.startsWith('image/') ||
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.heic')
      );
    });

    if (validFiles.length > 0 && onFilesUpload) {
      onFilesUpload(scheduleId, validFiles);
    } else if (validFiles.length === 0) {
      alert('画像またはPDFファイルのみアップロード可能です');
    }
  };

  return (
    <div className="space-y-3">
      <div
        data-dropzone="true"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          transition-all duration-200 rounded-lg
          ${
            isDragging
              ? 'bg-blue-50 border-2 border-dashed border-blue-500 p-2'
              : ''
          }
        `}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {files &&
            files.length > 0 &&
            files
              .slice(0, expandedSchedules.has(scheduleId) ? undefined : 6)
              .map((file) => (
                <div key={file.id} className="group relative">
                  {isImageFile(file) ? (
                    <div className="relative">
                      <div
                        className="relative w-full h-20 cursor-pointer"
                        onClick={() => onImageClick(file.url)}
                      >
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          unoptimized
                          loading="lazy"
                          className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {file.name.length > 10
                          ? `${file.name.substring(0, 10)}...`
                          : file.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDelete(scheduleId, file.id);
                        }}
                        className="absolute top-1 right-1 bg-stone-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className="flex items-center gap-2 p-2 bg-stone-100 rounded-lg hover:bg-stone-200 cursor-pointer transition-colors h-20"
                        onClick={() =>
                          isPDFFile(file) ? onPDFClick(file.url) : undefined
                        }
                      >
                        <FileText className="w-4 h-4 text-stone-600" />
                        <span className="text-sm text-stone-700 truncate">
                          {file.name.length > 15
                            ? `${file.name.substring(0, 15)}...`
                            : file.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDelete(scheduleId, file.id);
                        }}
                        className="absolute top-1 right-1 bg-stone-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

          {/* ファイル追加ボタン */}
          <button
            onClick={() => onFileUpload(scheduleId)}
            disabled={uploadingFiles.has(scheduleId)}
            className="flex flex-col items-center justify-center gap-1 h-20 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-2 border-dashed border-stone-300"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">
              {uploadingFiles.has(scheduleId)
                ? 'アップロード中...'
                : 'ファイル追加'}
            </span>
          </button>
        </div>

        {/* アコーディオン機能 */}
        {files && files.length > 6 && (
          <button
            onClick={() => onToggleExpand(scheduleId)}
            className="mt-2 flex items-center gap-1 text-sm text-stone-600 hover:text-stone-800 transition-colors cursor-pointer"
          >
            {expandedSchedules.has(scheduleId) ? (
              <>
                <ChevronUp className="w-4 h-4" />
                ファイルを閉じる
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {files.length - 6}件のファイルを表示
              </>
            )}
          </button>
        )}
      </div>

      {isDragging && (
        <div className="text-center py-2">
          <p className="text-sm text-blue-600 font-medium">
            ファイルをドロップしてアップロード
          </p>
        </div>
      )}
    </div>
  );
}
