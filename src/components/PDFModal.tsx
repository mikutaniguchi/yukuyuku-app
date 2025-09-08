'use client';

import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PDFModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  onClose: () => void;
}

export default function PDFModal({ isOpen, pdfUrl, onClose }: PDFModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // モバイルデバイスの検出
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full h-full md:w-[90%] md:h-[90%] max-w-6xl flex flex-col m-0 md:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-white rounded-t-lg">
          <h3 className="text-base md:text-lg font-semibold">PDF プレビュー</h3>
          <div className="flex items-center gap-2">
            {isMobile && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors p-1 flex items-center gap-1 text-sm"
                title="新しいタブで開く"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">新しいタブで開く</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-700 transition-colors p-1"
              aria-label="閉じる"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 min-h-[600px]"
            title="PDF Preview"
            style={{
              WebkitOverflowScrolling: 'touch',
              height: isMobile ? 'calc(100vh - 120px)' : '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
