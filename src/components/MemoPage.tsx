'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, FileText } from 'lucide-react';
import { Trip } from '@/types';
import { formatMarkdownText } from '@/lib/constants';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import ImageModal from './ImageModal';
import {
  uploadFileToStorage,
  deleteFileFromStorage,
  compressImage,
} from '@/lib/fileStorage';

interface MemoPageProps {
  trip: Trip;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
  canEdit?: boolean;
}

export default function MemoPage({
  trip,
  onTripUpdate,
  canEdit = true,
}: MemoPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);
  const handleMemoChange = (newMemo: string) => {
    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      memo: newMemo,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const value = textarea.value;

      // カーソル位置の行を取得
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];

      // 箇条書きの場合
      if (currentLine.match(/^-\s+(.*)$/)) {
        e.preventDefault();
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(start);
        const newValue = beforeCursor + '\n- ' + afterCursor;
        handleMemoChange(newValue);

        // カーソル位置を設定
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 3;
        }, 0);
      }

      // 番号付きリストの場合
      const numberedMatch = currentLine.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        e.preventDefault();
        const currentNumber = parseInt(numberedMatch[1]);
        const nextNumber = currentNumber + 1;
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(start);
        const newValue = beforeCursor + '\n' + nextNumber + '. ' + afterCursor;
        handleMemoChange(newValue);

        // カーソル位置を設定
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + 3 + nextNumber.toString().length;
        }, 0);
      }
    }
  };

  const handleMemoImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileId = `memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const filePath = `trips/${trip.id}/memo-images/${fileId}`;

        let processedFile = file;
        let originalSize = file.size;
        let compressedSize = file.size;

        // 画像ファイルかつ1MB以上の場合のみ圧縮
        if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
          try {
            const compressed = await compressImage(file);
            processedFile = compressed.file;
            originalSize = compressed.originalSize;
            compressedSize = compressed.compressedSize;
          } catch (error) {
            console.error('画像圧縮エラー:', error);
            // 圧縮に失敗した場合は元ファイルを使用
          }
        }

        const { url, fullPath } = await uploadFileToStorage(
          processedFile,
          filePath
        );

        return {
          id: fileId,
          name: file.name,
          type: file.type,
          url,
          fullPath,
          originalSize,
          compressedSize,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      onTripUpdate(trip.id, (currentTrip) => ({
        ...currentTrip,
        memoImages: [...(currentTrip.memoImages || []), ...uploadedFiles],
      }));
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMemoImageDelete = async (fileId: string | number) => {
    const fileToDelete = trip.memoImages?.find((f) => f.id === fileId);

    if (fileToDelete?.fullPath) {
      try {
        await deleteFileFromStorage(fileToDelete.fullPath);
      } catch (error) {
        console.error('Storage削除エラー:', error);
      }
    }

    onTripUpdate(trip.id, (currentTrip) => ({
      ...currentTrip,
      memoImages:
        currentTrip.memoImages?.filter((file) => file.id !== fileId) || [],
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) =>
        file.type.startsWith('image/') ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.type === 'application/pdf'
    );

    if (validFiles.length > 0) {
      handleMemoImageUpload(validFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      handleMemoImageUpload(selectedFiles);
    }
  };

  const isImageFile = (file: { type: string }) => {
    return file.type && file.type.startsWith('image/');
  };

  const isPDFFile = (file: { type: string }) => {
    return file.type === 'application/pdf';
  };

  const handleImageClick = (url: string) => {
    setSelectedImageUrl(url);
  };

  const handlePDFClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCloseImageModal = () => {
    setSelectedImageUrl(null);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-stone-800 mb-4">メモ</h2>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="small" />
        </div>
      ) : (
        <div className="space-y-4">
          {trip.memo && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-stone-800 mb-3">
                プレビュー
              </h3>
              <div className="bg-stone-50 rounded-lg p-4 whitespace-pre-wrap break-words">
                {formatMarkdownText(trip.memo)}
              </div>
            </div>
          )}

          {canEdit ? (
            <textarea
              value={trip.memo}
              onChange={(e) => handleMemoChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="# 大見出し ## 中見出し ### 小見出し
- 箇条書き
1. 番号付きリスト
URLはリンクになります。"
              className="w-full h-96 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none text-stone-900 bg-white"
            />
          ) : (
            <div className="w-full h-96 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg whitespace-pre-wrap break-words overflow-y-auto">
              {trip.memo || 'メモがありません'}
            </div>
          )}

          {/* 画像メモセクション */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h3 className="text-lg font-medium text-stone-800 mb-3">
              画像メモ
            </h3>

            {/* ファイル表示エリア */}
            {trip.memoImages && trip.memoImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {trip.memoImages.map((file) => (
                  <div key={file.id} className="group relative">
                    {isImageFile(file) ? (
                      <div
                        className="relative w-full h-[200px] cursor-pointer"
                        onClick={() => handleImageClick(file.url)}
                      >
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          unoptimized
                          loading="lazy"
                          className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {file.name.length > 15
                            ? `${file.name.substring(0, 15)}...`
                            : file.name}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative w-full h-[200px] cursor-pointer"
                        onClick={() =>
                          isPDFFile(file) ? handlePDFClick(file.url) : undefined
                        }
                      >
                        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors h-full">
                          <FileText className="w-12 h-12 text-stone-600" />
                          <span className="text-sm text-stone-700 text-center truncate w-full">
                            {file.name.length > 20
                              ? `${file.name.substring(0, 20)}...`
                              : file.name}
                          </span>
                        </div>
                      </div>
                    )}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMemoImageDelete(file.id);
                        }}
                        className="absolute top-2 right-2 bg-stone-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* アップロードエリア */}
            {canEdit && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-colors border-stone-300
                  ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <input
                  type="file"
                  id="memo-file-upload"
                  accept="image/*,.heic,.HEIC,application/pdf"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label htmlFor="memo-file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-stone-600 text-sm">
                    {uploadingImage
                      ? 'アップロード中...'
                      : 'クリックまたはドラッグ&ドロップでファイルを追加'}
                  </p>
                  <p className="text-stone-400 text-xs mt-1">
                    （画像・PDF対応）
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 画像モーダル */}
      <ImageModal
        isOpen={!!selectedImageUrl}
        imageUrl={selectedImageUrl}
        onClose={handleCloseImageModal}
      />
    </Card>
  );
}
