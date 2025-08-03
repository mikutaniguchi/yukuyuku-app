'use client';

import React, { useState } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { Trip } from '@/types';
import { colorPalette, generateInviteLink } from '@/lib/constants';
import Modal from './Modal';

interface InviteModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
}

export default function InviteModal({
  isOpen,
  trip,
  onClose,
}: InviteModalProps) {
  const [copiedInvite, setCopiedInvite] = useState(false);

  const copyInviteLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const inviteLink = generateInviteLink(trip.id, trip.inviteCode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="友達を招待"
      icon={UserPlus}
      iconColor={colorPalette.roseQuartz.bg}
    >
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            招待リンク
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-stone-100 rounded-lg text-sm break-all">
              {inviteLink}
            </div>
            <button
              onClick={() => copyInviteLink(inviteLink)}
              className="p-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              {copiedInvite ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
          <p className="font-medium mb-1">使い方：</p>
          <p>1. 招待リンクを友達に共有</p>
          <p>2. 友達がリンクをクリックしてアクセス</p>
          <p>3. 参加方法を選択</p>
          <p className="ml-4">• メンバー: Googleログインで編集・管理</p>
          <p className="ml-4">• ゲスト: ログイン不要で閲覧のみ</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 text-white rounded-lg transition-colors font-medium"
        style={{
          backgroundColor: colorPalette.roseQuartz.bg,
          color: colorPalette.roseQuartz.text,
        }}
      >
        閉じる
      </button>
    </Modal>
  );
}
