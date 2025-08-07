'use client';

import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { Trip, User } from '@/types';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';

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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="旅行メンバー"
        icon={Users}
        iconColor={colorPalette.rubyGrey.bg}
      >
        <div className="space-y-3 mb-6">
          {trip.members && trip.members.length > 0 ? (
            trip.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-stone-200 rounded-lg"
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
                  <button
                    onClick={() => handleDeleteMemberClick(member)}
                    className="p-1 text-stone-500 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-stone-500 py-4">
              メンバーが見つかりません
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-white rounded-lg transition-colors font-medium"
          style={{
            backgroundColor: colorPalette.rubyGrey.bg,
            color: colorPalette.rubyGrey.text,
          }}
        >
          閉じる
        </button>
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
              <button
                onClick={() => removeMember(memberToDelete.id)}
                className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: colorPalette.sandRed.bg,
                  color: colorPalette.sandRed.text,
                }}
              >
                削除する
              </button>
              <button
                onClick={() => {
                  setShowDeleteMemberModal(false);
                  setMemberToDelete(null);
                }}
                className="flex-1 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors font-medium"
              >
                キャンセル
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
