'use client';

import React, { useState } from 'react';
import { Settings, User as UserIcon, Trash2 } from 'lucide-react';
import { User } from '@/types';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import { DeleteButton, CancelButton } from './buttons';
import InlineEditForm from './InlineEditForm';

interface UserSettingsModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdateUser: (newName: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export default function UserSettingsModal({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onDeleteAccount,
}: UserSettingsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleSaveName = async (newName: string) => {
    setIsSaving(true);
    try {
      await onUpdateUser(newName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update user name:', error);
      alert('名前の更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
  };

  const handleStartEdit = () => {
    setIsEditingName(true);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmName === user.name) {
      try {
        await onDeleteAccount();
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('アカウントの削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const resetForm = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showDeleteConfirm}
        onClose={handleClose}
        title="ユーザー設定"
        icon={Settings}
        iconColor={colorPalette.aquaBlue.bg}
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* 名前編集 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-stone-700">
                <UserIcon className="w-4 h-4 inline mr-2" />
                表示名
              </label>
            </div>

            <InlineEditForm
              value={user.name}
              isEditing={isEditingName && !isSaving}
              onStartEdit={handleStartEdit}
              onSave={handleSaveName}
              onCancel={handleCancelNameEdit}
              placeholder="名前を入力してください"
              displayClassName="p-3 border border-stone-200 rounded-lg bg-stone-50 text-stone-800"
            />
          </div>

          {/* アカウント情報 */}
          <div className="bg-stone-50 p-4 rounded-lg">
            <h3 className="font-medium text-stone-800 mb-2">アカウント情報</h3>
            <div className="text-sm text-stone-600 space-y-1">
              <div>メール: {user.email || '未設定'}</div>
              <div>
                タイプ: {user.type === 'google' ? 'Googleアカウント' : 'ゲスト'}
              </div>
            </div>
          </div>

          {/* 危険な操作 */}
          {user.type !== 'guest' && (
            <div className="border-t border-stone-200 pt-6">
              <h3 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                危険な操作
              </h3>
              <DeleteButton
                onClick={() => setShowDeleteConfirm(true)}
                size="md"
                fullWidth
              />
            </div>
          )}
        </div>
      </Modal>

      {/* アカウント削除確認モーダル */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="アカウント削除の確認"
        icon={Trash2}
        iconColor="#DC2626"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              <strong>警告:</strong>{' '}
              この操作は取り消せません。アカウントを削除すると、すべてのデータが失われます。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              確認のため、あなたの名前「<strong>{user.name}</strong>
              」を入力してください:
            </label>
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-stone-900 bg-white"
              placeholder={user.name}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <DeleteButton
              onClick={handleDeleteAccount}
              disabled={deleteConfirmName !== user.name}
              size="md"
              fullWidth
            />
            <CancelButton
              onClick={() => setShowDeleteConfirm(false)}
              size="md"
              className="flex-1"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
