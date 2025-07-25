'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Check } from 'lucide-react';
import { Trip } from '@/types';
import { colorPalette, generateInviteLink } from '@/lib/constants';

interface InviteModalProps {
  trip: Trip;
  onClose: () => void;
}

export default function InviteModal({ trip, onClose }: InviteModalProps) {
  const [copiedInvite, setCopiedInvite] = useState(false);

  const copyInviteLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const inviteLink = generateInviteLink(trip.id, trip.inviteCode);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-stone-800">友達を招待</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">招待コード</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-stone-100 rounded-lg font-mono text-lg font-bold text-center">
                {trip.inviteCode}
              </div>
              <button
                onClick={() => copyInviteLink(trip.inviteCode)}
                className="p-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                {copiedInvite ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">招待リンク</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-stone-100 rounded-lg text-sm break-all">
                {inviteLink}
              </div>
              <button
                onClick={() => copyInviteLink(inviteLink)}
                className="p-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                {copiedInvite ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">QRコード</span>
            </div>
            <div className="w-32 h-32 bg-white border-2 border-blue-200 rounded-lg mx-auto flex items-center justify-center">
              <div className="text-xs text-stone-500 text-center">
                QRコード<br />
                (実装時に生成)
              </div>
            </div>
          </div>

          <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
            <p className="font-medium mb-1">使い方：</p>
            <p>1. 招待コードまたはリンクを友達に送信</p>
            <p>2. 友達がゲストログインで招待コードを入力</p>
            <p>3. 自動的に旅行メンバーに追加されます</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-white rounded-lg transition-colors font-medium"
          style={{ 
            backgroundColor: colorPalette.roseQuartz.bg,
            color: colorPalette.roseQuartz.text 
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}