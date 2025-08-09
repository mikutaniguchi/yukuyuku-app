'use client';

import React, { useState } from 'react';
import { Users, X, Copy, Check } from 'lucide-react';
import { Trip, User } from '@/types';
import { colorPalette, generateInviteLink } from '@/lib/constants';
import Modal from './Modal';
import Button from './Button';

interface MembersModalProps {
  isOpen: boolean;
  trip: Trip;
  user: User | null;
  onClose: () => void;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
}

export default function MembersModal({
  isOpen,
  trip,
  user,
  onClose,
  onTripUpdate,
}: MembersModalProps) {
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<
    Trip['members'][0] | null
  >(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleDeleteMemberClick = (member: Trip['members'][0]) => {
    setMemberToDelete(member);
    setShowDeleteMemberModal(true);
  };

  const removeMember = (memberId: string) => {
    if (trip.creator === user?.id) {
      onTripUpdate(trip.id, (currentTrip) => ({
        ...currentTrip,
        members: currentTrip.members.filter((m) => m.id !== memberId),
        memberIds: currentTrip.memberIds.filter((id) => id !== memberId),
      }));
      setShowDeleteMemberModal(false);
      setMemberToDelete(null);
    }
  };

  const copyInviteLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const inviteLink = generateInviteLink(trip.id, trip.inviteCode);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="メンバー"
        icon={Users}
        iconColor={colorPalette.sandRed.bg}
      >
        {/* 招待セクション */}
        <div className="mb-6">
          <div className="text-sm font-medium text-stone-700 mb-2">
            招待リンク
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 px-3 py-2 bg-stone-100 rounded-lg text-sm break-all">
              {inviteLink}
            </div>
            <Button
              onClick={() => copyInviteLink(inviteLink)}
              variant="icon"
              className="text-stone-600 hover:text-stone-800"
            >
              {copiedInvite ? (
                <Check className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="text-xs text-stone-500 bg-stone-50 p-2 rounded">
            友達を招待：メンバー（編集可）／ ゲスト（閲覧のみ）
          </div>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-stone-200 my-4" />

        {/* メンバーセクション */}
        <div className="space-y-3 mb-6">
          <div className="text-sm font-medium text-stone-700">
            現在のメンバー
          </div>
          {trip.members && trip.members.length > 0 ? (
            trip.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-stone-50"
              >
                <div>
                  <div className="font-medium text-stone-800">
                    {member.name || 'ユーザー'}
                  </div>
                  {member.id === trip.creator && (
                    <div className="text-sm text-stone-500">(作成者)</div>
                  )}
                </div>
                {trip.creator === user?.id && member.id !== trip.creator && (
                  <Button
                    onClick={() => handleDeleteMemberClick(member)}
                    variant="icon"
                    className="text-stone-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-stone-500 py-4">
              メンバーが見つかりません
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteMemberModal && !!memberToDelete}
        onClose={() => {
          setShowDeleteMemberModal(false);
          setMemberToDelete(null);
        }}
        title="メンバーを削除"
        icon={X}
        iconColor="#DC2626"
        maxWidth="sm"
      >
        {memberToDelete && (
          <>
            <p className="text-stone-600 mb-6">
              <span className="font-medium">{memberToDelete.name}</span>
              さんを旅行から削除しますか？
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => removeMember(memberToDelete.id)}
                color="sandRed"
                className="flex-1"
              >
                削除する
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteMemberModal(false);
                  setMemberToDelete(null);
                }}
                variant="outlined"
                color="sandRed"
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
