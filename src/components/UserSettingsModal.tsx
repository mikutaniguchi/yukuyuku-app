'use client';

import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  Trash2,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { User } from '@/types';
import { colorPalette } from '@/lib/constants';
import Modal from './Modal';
import Button from './Button';

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
  const [editedName, setEditedName] = useState(user.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleSaveName = async () => {
    if (!editedName.trim()) return;

    setIsSaving(true);
    try {
      await onUpdateUser(editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update user name:', error);
      alert('名前の更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNameEdit = () => {
    setEditedName(user.name);
    setIsEditingName(false);
  };

  const handleStartEdit = () => {
    setEditedName(user.name);
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
    setEditedName(user.name);
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

            {isEditingName ? (
              <div className="flex items-center gap-2 p-3 border border-stone-300 rounded-lg bg-stone-50/50">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-stone-800"
                  placeholder="名前を入力してください"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelNameEdit();
                  }}
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveName}
                    disabled={
                      !editedName.trim() || editedName === user.name || isSaving
                    }
                    className="p-1 text-green-600 hover:text-green-700 disabled:text-stone-400 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelNameEdit}
                    disabled={isSaving}
                    className="p-1 text-stone-500 hover:text-stone-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleStartEdit}
                className="flex items-center justify-between p-3 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors group"
              >
                <span className="text-stone-800">{user.name}</span>
                <Edit2 className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
              </div>
            )}
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
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                color="sandRed"
                size="md"
                className="w-full"
              >
                アカウントを削除
              </Button>
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
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={user.name}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmName !== user.name}
              color="sandRed"
              size="md"
              className="flex-1"
            >
              <Trash2 className="w-4 h-4" />
              削除する
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              color="rubyGrey"
              size="md"
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
