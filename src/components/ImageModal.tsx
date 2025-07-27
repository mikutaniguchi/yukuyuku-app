'use client';

import React from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  alt?: string;
  onClose: () => void;
}

export default function ImageModal({ isOpen, imageUrl, alt = "拡大表示", onClose }: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-4xl">
        <img 
          src={imageUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        />
      </div>
    </div>
  );
}