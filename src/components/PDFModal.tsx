'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PDFModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  onClose: () => void;
}

export default function PDFModal({ isOpen, pdfUrl, onClose }: PDFModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !pdfUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">PDF プレビュー</h3>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4">
          <iframe 
            src={pdfUrl}
            className="w-full h-full rounded"
            title="PDF Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}