'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Trip, User } from '@/types';
import { colorPalette } from '@/lib/constants';

interface MembersModalProps {
  trip: Trip;
  user: User | null;
  onClose: () => void;
  onTripUpdate: (tripId: string, updateFunction: (trip: Trip) => Trip) => void;
}

export default function MembersModal({ trip, user, onClose, onTripUpdate }: MembersModalProps) {
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Trip['members'][0] | null>(null);

  const handleDeleteMemberClick = (member: Trip['members'][0]) => {
    setMemberToDelete(member);
    setShowDeleteMemberModal(true);
  };

  const removeMember = (memberId: string) => {
    if (trip.creator === user?.id) {
      onTripUpdate(trip.id, (currentTrip) => ({
        ...currentTrip,
        members: currentTrip.members.filter(m => m.id !== memberId)
      }));
      setShowDeleteMemberModal(false);
      setMemberToDelete(null);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-4 text-stone-800">旅行メンバー</h3>
          <div className="space-y-3 mb-6">
            {trip.members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-stone-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
                    style={{ backgroundColor: colorPalette.aquaBlue.light, color: colorPalette.aquaBlue.bg }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-stone-800">{member.name}</div>
                    <div className="text-sm text-stone-500">
                      {member.type === 'google' ? 'Googleアカウント' : 'ゲスト'}
                      {member.id === trip.creator && ' (作成者)'}
                    </div>
                  </div>
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
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 text-white rounded-lg transition-colors font-medium"
            style={{ 
              backgroundColor: colorPalette.rubyGrey.bg,
              color: colorPalette.rubyGrey.text 
            }}
          >
            閉じる
          </button>
        </div>
      </div>

      {/* Delete Member Modal */}
      {showDeleteMemberModal && memberToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-[60]"
          onClick={() => {
            setShowDeleteMemberModal(false);
            setMemberToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-stone-800">メンバーを削除</h3>
            <p className="text-stone-600 mb-6">
              <span className="font-medium">{memberToDelete.name}</span>さんを旅行から削除しますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => removeMember(memberToDelete.id)}
                className="flex-1 py-2 text-white rounded-lg transition-colors font-medium"
                style={{ 
                  backgroundColor: colorPalette.sandRed.bg,
                  color: colorPalette.sandRed.text 
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
          </div>
        </div>
      )}
    </>
  );
}