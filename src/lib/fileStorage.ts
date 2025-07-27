import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface CompressedFile {
  file: File;
  originalSize: number;
  compressedSize: number;
}

// 画像を軽量圧縮（画質保持）
export const compressImage = async (file: File, maxSizeMB: number = 2): Promise<CompressedFile> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 元のサイズを保持（リサイズしない）
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // 品質を調整して圧縮（0.9 = 90%品質）
        let quality = 0.9;
        let compressedFile: File;
        
        const compress = () => {
          canvas.toBlob((blob) => {
            if (blob) {
              compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              // 目標サイズ以下または品質が最低レベルなら完了
              if (compressedFile.size <= maxSizeMB * 1024 * 1024 || quality <= 0.5) {
                resolve({
                  file: compressedFile,
                  originalSize: file.size,
                  compressedSize: compressedFile.size
                });
              } else {
                // 品質を下げて再圧縮
                quality -= 0.1;
                compress();
              }
            }
          }, 'image/jpeg', quality);
        };
        
        compress();
      }
    };

    img.src = URL.createObjectURL(file);
  });
};

// ファイルをFirebase Storageにアップロード
export const uploadFileToStorage = async (
  file: File, 
  path: string
): Promise<{ url: string; fullPath: string }> => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  
  return {
    url,
    fullPath: fileRef.fullPath
  };
};

// ファイルをFirebase Storageから削除
export const deleteFileFromStorage = async (fullPath: string): Promise<void> => {
  const fileRef = ref(storage, fullPath);
  await deleteObject(fileRef);
};

// ファイル処理（圧縮→アップロード）
export const processAndUploadFile = async (
  file: File,
  tripId: string,
  scheduleId: string
): Promise<{
  id: string;
  name: string;
  type: string;
  url: string;
  fullPath: string;
  originalSize: number;
  compressedSize: number;
}> => {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const filePath = `trips/${tripId}/schedules/${scheduleId}/${fileId}`;
  
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
      processedFile = file;
    }
  }
  
  const { url, fullPath } = await uploadFileToStorage(processedFile, filePath);
  
  return {
    id: fileId,
    name: file.name,
    type: file.type,
    url,
    fullPath,
    originalSize,
    compressedSize
  };
};