'use client';

import React from 'react';
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
}: ScheduleFilesProps) {
  const isImageFile = (file: UploadedFile) => {
    return file.type && file.type.startsWith('image/');
  };

  const isPDFFile = (file: UploadedFile) => {
    return file.type === 'application/pdf';
  };

  return (
    <div className="space-y-3">
      {files && files.length > 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {files.slice(0, expandedSchedules.has(scheduleId) ? undefined : 6).map(file => (
              <div key={file.id} className="group relative">
                {isImageFile(file) ? (
                  <div className="relative">
                    <div className="relative w-full h-20 cursor-pointer" onClick={() => onImageClick(file.url)}>
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
                      className="flex items-center gap-2 p-2 bg-stone-100 rounded-lg hover:bg-stone-200 cursor-pointer transition-colors"
                      onClick={() => isPDFFile(file) ? onPDFClick(file.url) : undefined}
                    >
                      <FileText className="w-4 h-4 text-stone-600" />
                      <span className="text-sm text-stone-700 truncate">
                        {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
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
          </div>
          
          {/* アコーディオン機能 */}
          {files.length > 6 && (
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
      )}

      {/* ファイル追加ボタン */}
      <button
        onClick={() => onFileUpload(scheduleId)}
        disabled={uploadingFiles.has(scheduleId)}
        className="flex items-center gap-2 px-3 py-1 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        {uploadingFiles.has(scheduleId) ? 'アップロード中...' : 'ファイル追加'}
      </button>
    </div>
  );
}