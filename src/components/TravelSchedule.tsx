'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTravelSchedule } from '@/hooks/useTravelSchedule';
import { logout } from '@/lib/auth';
import {
  Calendar,
  Users,
  Plus,
  LogOut,
  Settings,
  BookOpen,
  CheckSquare,
  DollarSign,
  FileText,
  Edit2,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { PageType } from '@/types';
import { colorPalette, getDatesInRange, formatDate } from '@/lib/constants';
import LoginModal from './LoginModal';
import MembersModal from './MembersModal';
import CreateTripModal from './CreateTripModal';
import DeleteTripModal from './DeleteTripModal';
import SchedulePage from './SchedulePage';
import MemoPage from './MemoPage';
import ChecklistPage from './ChecklistPage';
import BudgetPage from './BudgetPage';
import FilesPage from './FilesPage';
import { Button } from './buttons';

export default function TravelSchedule() {
  const {
    // 認証状態
    appUser,
    showLoginModal,
    authLoading,

    // 旅行データ
    trips,
    selectedTrip,
    selectedDate,
    loadingTrips,
    showCreateTripModal,
    setShowCreateTripModal,
    setSelectedTrip,
    setSelectedDate,

    // 操作関数
    handleLogin,
    handleCreateTrip,
    updateTrip,
    deleteTrip,

    // 権限
    isGuestUser,
    canEdit,
    isCreator,
  } = useTravelSchedule();

  // UI状態
  const [currentPage, setCurrentPage] = useState<PageType>('schedule');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingTripTitle, setEditingTripTitle] = useState(false);
  const [tempTripTitle, setTempTripTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');
  const [showTripSettings, setShowTripSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'schedule' as const, label: 'スケジュール', icon: Calendar },
    { id: 'checklist' as const, label: 'チェックリスト', icon: CheckSquare },
    { id: 'files' as const, label: 'ファイル', icon: FileText },
    { id: 'memo' as const, label: 'メモ', icon: BookOpen },
    { id: 'budget' as const, label: '予算管理', icon: DollarSign },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteTrip = () => {
    setDeleteConfirmTitle('');
    setShowDeleteConfirm(true);
    setShowTripSettings(false);
  };

  const confirmDeleteTrip = async () => {
    if (!selectedTrip || deleteConfirmTitle !== selectedTrip.title) {
      return;
    }

    try {
      await deleteTrip(selectedTrip.id);
      setShowDeleteConfirm(false);
      setDeleteConfirmTitle('');
    } catch {
      alert('旅行の削除に失敗しました');
    }
  };

  const cancelDeleteTrip = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmTitle('');
  };

  const handleEditTripTitle = () => {
    setTempTripTitle(selectedTrip?.title || '');
    setEditingTripTitle(true);
    setShowTripSettings(false);
  };

  const handleSaveTripTitle = async () => {
    if (!selectedTrip || !tempTripTitle.trim()) return;

    try {
      await updateTrip(selectedTrip.id, (trip) => ({
        ...trip,
        title: tempTripTitle.trim(),
      }));
      setEditingTripTitle(false);
    } catch (error) {
      console.error('Failed to update trip title:', error);
      alert('タイトルの更新に失敗しました');
    }
  };

  const handleCancelEditTitle = () => {
    setEditingTripTitle(false);
    setTempTripTitle('');
  };

  const hasAccess =
    appUser &&
    selectedTrip &&
    (selectedTrip.members.some(
      (m) =>
        m.id === appUser.id ||
        (m.name === appUser.name && m.type === appUser.type)
    ) ||
      (appUser.type === 'guest' && selectedTrip.guestAccessEnabled !== false));

  // Auto-select first accessible trip
  useEffect(() => {
    if (appUser && trips.length > 0) {
      const userTrips = trips.filter(
        (trip) =>
          trip.members.some(
            (m) =>
              m.id === appUser.id ||
              (m.name === appUser.name && m.type === appUser.type)
          ) ||
          (appUser.type === 'guest' && trip.guestAccessEnabled !== false)
      );
      if (userTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(userTrips[0]);
        setSelectedDate(
          getDatesInRange(userTrips[0].startDate, userTrips[0].endDate)[0]
        );
      }
    }
  }, [appUser, trips, selectedTrip, setSelectedTrip, setSelectedDate]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowTripSettings(false);
      }
    };

    if (showTripSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTripSettings]);

  // ローディング中
  if (authLoading || loadingTrips) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center">
        <div className="text-stone-600">読み込み中...</div>
      </div>
    );
  }

  // ログイン画面
  if (showLoginModal) {
    return <LoginModal onLogin={handleLogin} />;
  }

  // 旅行がない場合は作成フォームを表示
  if (!selectedTrip && appUser) {
    if (showCreateTripModal) {
      return (
        <CreateTripModal
          isOpen={showCreateTripModal}
          onCreateTrip={handleCreateTrip}
        />
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-4">
            旅行がありません
          </h2>
          <p className="text-stone-600 mb-6">
            新しい旅行を作成して始めましょう
          </p>
          <Button
            onClick={() => setShowCreateTripModal(true)}
            color="abyssGreen"
            size="md"
            className="mx-auto"
          >
            <Plus className="w-5 h-5" />
            新しい旅行を作成
          </Button>
        </div>
      </div>
    );
  }

  // アクセス権限がない場合
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-4">
            アクセス権限がありません
          </h2>
          <p className="text-stone-600 mb-6">
            この旅行にアクセスするには招待が必要です
          </p>
          <Button onClick={handleLogout} color="sandRed" size="md">
            ログイン画面に戻る
          </Button>
        </div>
      </div>
    );
  }

  const isCreatorOfSelectedTrip = selectedTrip
    ? isCreator(selectedTrip.id)
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <CreateTripModal
        isOpen={showCreateTripModal}
        onCreateTrip={handleCreateTrip}
        onClose={() => setShowCreateTripModal(false)}
      />
      <div className="container mx-auto px-4 py-6">
        {/* User info bar */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm border border-stone-200 px-4 py-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: colorPalette.aquaBlue.light,
                color: colorPalette.aquaBlue.bg,
              }}
            >
              {appUser?.name.charAt(0)}
            </div>
            <span className="font-medium text-stone-700">{appUser?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>

        {/* Trip Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {trips
            .filter(
              (trip) =>
                trip.members.some(
                  (m) =>
                    m.id === appUser?.id ||
                    (m.name === appUser?.name && m.type === appUser?.type)
                ) ||
                (appUser?.type === 'guest' && trip.guestAccessEnabled !== false)
            )
            .map((trip) => (
              <button
                key={trip.id}
                onClick={() => {
                  setSelectedTrip(trip);
                  setSelectedDate(
                    getDatesInRange(trip.startDate, trip.endDate)[0]
                  );
                  setCurrentPage('schedule');
                }}
                className={`px-4 py-2 rounded-lg transition-colors shadow-sm font-medium ${
                  selectedTrip?.id === trip.id
                    ? 'text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-700 hover:shadow-md hover:border-stone-300'
                }`}
                style={
                  selectedTrip?.id === trip.id
                    ? {
                        backgroundColor: colorPalette.aquaBlue.bg,
                        color: colorPalette.aquaBlue.text,
                      }
                    : {}
                }
              >
                {trip.title}
              </button>
            ))}
          {!isGuestUser && (
            <button
              onClick={() => setShowCreateTripModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-stone-300 text-stone-600 rounded-lg hover:border-stone-400 hover:text-stone-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新しい旅行
            </button>
          )}
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Calendar
                className="w-8 h-8"
                style={{ color: colorPalette.aquaBlue.bg }}
              />
              {editingTripTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTripTitle}
                    onChange={(e) => setTempTripTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveTripTitle();
                      if (e.key === 'Escape') handleCancelEditTitle();
                    }}
                    className="text-xl md:text-3xl font-bold text-stone-800 bg-transparent border-b-2 border-stone-300 focus:outline-none focus:border-stone-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTripTitle}
                    className="p-1 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEditTitle}
                    className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 relative">
                  <h1 className="text-xl md:text-3xl font-bold text-stone-800">
                    {selectedTrip?.title}
                  </h1>
                  {canEdit && (
                    <div className="relative" ref={settingsRef}>
                      <button
                        onClick={() => setShowTripSettings(!showTripSettings)}
                        className="p-1 text-stone-400 hover:text-stone-600 transition-colors opacity-60 hover:opacity-100"
                      >
                        <Settings className="w-5 h-5" />
                      </button>

                      {showTripSettings && (
                        <div className="absolute top-8 right-0 bg-white border border-stone-200 rounded-lg shadow-lg py-2 w-40 z-10">
                          <button
                            onClick={handleEditTripTitle}
                            className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            タイトル変更
                          </button>
                          {isCreatorOfSelectedTrip && (
                            <>
                              <div className="border-t border-stone-200 my-1" />
                              <button
                                onClick={() =>
                                  updateTrip(selectedTrip!.id, (trip) => ({
                                    ...trip,
                                    guestAccessEnabled: !(
                                      trip.guestAccessEnabled ?? true
                                    ),
                                  }))
                                }
                                className="w-full px-4 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                              >
                                <span className="text-sm">ゲストアクセス</span>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    selectedTrip?.guestAccessEnabled !== false
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                                  }`}
                                />
                              </button>
                              <div className="border-t border-stone-200 my-1" />
                            </>
                          )}
                          <button
                            onClick={handleDeleteTrip}
                            className="w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            旅行を削除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMembersModal(true)}
                color="sandRed"
                size="md"
              >
                <Users className="w-4 h-4" />
                メンバー
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedTrip?.startDate || '')} -{' '}
              {formatDate(selectedTrip?.endDate || '')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {selectedTrip?.members.length}人参加
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const colors = Object.values(colorPalette);
            const color = colors[index % colors.length];
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                  currentPage === item.id
                    ? 'text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-600 hover:shadow-md hover:border-stone-300'
                }`}
                style={
                  currentPage === item.id
                    ? {
                        backgroundColor: color.bg,
                        color: color.text,
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Page Content */}
        {currentPage === 'schedule' && selectedTrip && (
          <SchedulePage
            trip={selectedTrip}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onTripUpdate={canEdit ? updateTrip : () => {}}
            canEdit={canEdit}
          />
        )}
        {currentPage === 'memo' && selectedTrip && (
          <MemoPage
            trip={selectedTrip}
            onTripUpdate={canEdit ? updateTrip : () => {}}
            canEdit={canEdit}
          />
        )}
        {currentPage === 'checklist' && selectedTrip && (
          <ChecklistPage
            trip={selectedTrip}
            onTripUpdate={canEdit ? updateTrip : () => {}}
            canEdit={canEdit}
          />
        )}
        {currentPage === 'budget' && selectedTrip && (
          <BudgetPage trip={selectedTrip} />
        )}
        {currentPage === 'files' && selectedTrip && (
          <FilesPage trip={selectedTrip} />
        )}
      </div>

      {/* Modals */}
      {selectedTrip && (
        <>
          <MembersModal
            isOpen={showMembersModal}
            trip={selectedTrip}
            user={appUser}
            onClose={() => setShowMembersModal(false)}
            onTripUpdate={updateTrip}
          />

          <DeleteTripModal
            isOpen={showDeleteConfirm}
            trip={selectedTrip}
            deleteConfirmTitle={deleteConfirmTitle}
            onDeleteConfirmTitleChange={setDeleteConfirmTitle}
            onConfirmDelete={confirmDeleteTrip}
            onCancel={cancelDeleteTrip}
          />
        </>
      )}
    </div>
  );
}
