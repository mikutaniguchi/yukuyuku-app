'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
  notFound,
} from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { TripProvider } from '@/contexts/TripContext';
import {
  getTrip,
  updateTrip as updateTripInFirestore,
  deleteTrip as deleteTripFromFirestore,
} from '@/lib/firestore';
import {
  Calendar,
  Users,
  UserPlus,
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
import { Trip, User } from '@/types';
import { colorPalette, formatDate } from '@/lib/constants';
import { updateUserDisplayName, deleteCurrentUser } from '@/lib/auth';
import UserSettingsModal from '@/components/UserSettingsModal';
import {
  updateUserNameInAllTrips,
  removeUserFromAllTrips,
} from '@/lib/firestore';
import Button from '@/components/Button';
import MembersModal from '@/components/MembersModal';
import InviteModal from '@/components/InviteModal';
import DeleteTripModal from '@/components/DeleteTripModal';
import Header from '@/components/Header';
import FloatingNavMenu from '@/components/FloatingNavMenu';
import LoadingScreen from '@/components/LoadingScreen';

interface TripLayoutProps {
  children: React.ReactNode;
}

export default function TripLayout({ children }: TripLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: firebaseUser, isGuest } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTripTitle, setEditingTripTitle] = useState(false);
  const [tempTripTitle, setTempTripTitle] = useState('');
  const [showTripSettings, setShowTripSettings] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [selectedPage, setSelectedPage] = useState<
    'schedule' | 'checklist' | 'files' | 'memo' | 'budget'
  >('schedule');
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');
  const tripSettingsRef = useRef<HTMLDivElement>(null);

  const tripId = params.tripId as string;

  const navItems = [
    {
      id: 'schedule' as const,
      path: `/trip/${tripId}`,
      label: 'スケジュール',
      icon: Calendar,
    },
    {
      id: 'checklist' as const,
      path: `/trip/${tripId}/checklist`,
      label: 'チェックリスト',
      icon: CheckSquare,
    },
    {
      id: 'files' as const,
      path: `/trip/${tripId}/files`,
      label: 'ファイル',
      icon: FileText,
    },
    {
      id: 'memo' as const,
      path: `/trip/${tripId}/memo`,
      label: 'メモ',
      icon: BookOpen,
    },
    {
      id: 'budget' as const,
      path: `/trip/${tripId}/budget`,
      label: '予算管理',
      icon: DollarSign,
    },
  ];

  // ページ全体でのドラッグ&ドロップデフォルト動作を防ぐ（ドロップゾーン以外）
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      // ドロップゾーン内でない場合のみ防ぐ
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropzone="true"]')) {
        e.preventDefault();
      }
    };

    const handleDrop = (e: DragEvent) => {
      // ドロップゾーン内でない場合のみ防ぐ
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropzone="true"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  // 旅行設定メニューの外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tripSettingsRef.current &&
        !tripSettingsRef.current.contains(event.target as Node)
      ) {
        setShowTripSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadTrip = async () => {
      if (!firebaseUser || !tripId) {
        setLoading(false);
        return;
      }

      try {
        // 参加直後の場合は少し待機してからデータを取得
        const isFromJoin = document.referrer.includes('/join/');
        if (isFromJoin) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const tripData = await getTrip(tripId);
        if (tripData) {
          setTrip(tripData);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Failed to load trip:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [firebaseUser, tripId]);

  // pathnameが変更された時にselectedPageを同期
  useEffect(() => {
    if (pathname === `/trip/${tripId}/checklist`) setSelectedPage('checklist');
    else if (pathname === `/trip/${tripId}/files`) setSelectedPage('files');
    else if (pathname === `/trip/${tripId}/memo`) setSelectedPage('memo');
    else if (pathname === `/trip/${tripId}/budget`) setSelectedPage('budget');
    else setSelectedPage('schedule');
  }, [pathname, tripId]);

  const updateTrip = async (updateFunction: (trip: Trip) => Trip) => {
    if (!trip) return;

    const updatedTrip = updateFunction(trip);
    setTrip(updatedTrip);

    try {
      await updateTripInFirestore(trip.id, updatedTrip);
    } catch (error) {
      console.error('Failed to update trip:', error);
      // 失敗時は元に戻す
      setTrip(trip);
    }
  };

  const handleEditTripTitle = () => {
    if (!trip) return;
    setTempTripTitle(trip.title);
    setEditingTripTitle(true);
    setShowTripSettings(false);
  };

  const handleSaveTripTitle = async () => {
    if (!trip || !tempTripTitle.trim()) return;

    await updateTrip((t) => ({
      ...t,
      title: tempTripTitle.trim(),
    }));
    setEditingTripTitle(false);
  };

  const handleCancelEditTitle = () => {
    setEditingTripTitle(false);
    setTempTripTitle('');
  };

  const handleDeleteTrip = () => {
    setDeleteConfirmTitle('');
    setShowDeleteConfirm(true);
    setShowTripSettings(false);
  };

  const confirmDeleteTrip = async () => {
    if (!trip || deleteConfirmTitle !== trip.title) {
      return;
    }

    try {
      await deleteTripFromFirestore(trip.id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('旅行の削除に失敗しました');
    }
  };

  const handleUpdateUserName = async (newName: string) => {
    if (!firebaseUser) return;

    try {
      // Firebase Authの表示名を更新
      await updateUserDisplayName(newName);

      // 全ての関連旅行のメンバー情報を更新
      await updateUserNameInAllTrips(firebaseUser.uid, newName);

      // 現在のトリップデータも更新（即座に反映するため）
      if (trip) {
        const updatedTrip = {
          ...trip,
          members: trip.members.map((member) =>
            member.id === firebaseUser.uid
              ? { ...member, name: newName }
              : member
          ),
        };
        setTrip(updatedTrip);
      }
    } catch (error) {
      console.error('Failed to update user name:', error);
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return;

    try {
      // 全ての旅行からユーザーを削除
      await removeUserFromAllTrips(firebaseUser.uid);

      // Firebaseアカウントを削除
      await deleteCurrentUser();

      // ホームページにリダイレクト
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingScreen message="旅行データを読み込み中..." />;
  }

  if (!trip || !firebaseUser) {
    return null;
  }

  const isGuestAccess = searchParams.get('guest') === 'true';

  const appUser: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (isGuest ? 'ゲスト' : 'ユーザー'),
    email: firebaseUser.email || '',
    type: isGuest ? 'guest' : 'google',
  };

  const isCreator = trip.creator === appUser.id;
  const isMember = trip.members.some((m) => m.id === appUser.id);

  // 編集権限の判定
  const canEdit = (() => {
    // ゲストアクセスの場合は編集不可
    if (isGuest || isGuestAccess) {
      return false;
    }
    // 通常ユーザーの場合（作成者またはメンバー）
    return isCreator || isMember;
  })();

  // 現在のページを判定
  const getCurrentPage = ():
    | 'schedule'
    | 'checklist'
    | 'files'
    | 'memo'
    | 'budget' => {
    return selectedPage;
  };

  const handlePageChange = (
    pageId: 'schedule' | 'checklist' | 'files' | 'memo' | 'budget'
  ) => {
    // 即座にselectedPageを更新（タブの色を即座に変更）
    setSelectedPage(pageId);

    const targetItem = navItems.find((item) => item.id === pageId);
    if (targetItem) {
      router.push(targetItem.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        {appUser && (
          <Header
            user={appUser}
            tripId={tripId}
            onSettingsClick={() => setShowUserSettings(true)}
          />
        )}

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
                    {trip.title}
                  </h1>
                  {canEdit && !isGuest && !isGuestAccess && (
                    <div className="relative" ref={tripSettingsRef}>
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
                          {isCreator && (
                            <>
                              <div className="border-t border-stone-200 my-1" />
                              <button
                                onClick={handleDeleteTrip}
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                旅行を削除
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isGuest && !isGuestAccess && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowMembersModal(true)}
                  color="rubyGrey"
                  size="md"
                >
                  <Users className="w-4 h-4" />
                  メンバー
                </Button>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  color="roseQuartz"
                  size="md"
                >
                  <UserPlus className="w-4 h-4" />
                  招待
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {trip.members.length}人参加
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const colors = Object.values(colorPalette);
            const color = colors[index % colors.length];
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-600 hover:shadow-md hover:border-stone-300'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: color.bg,
                        color: color.text,
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Page Content */}
        <TripProvider trip={trip} updateTrip={updateTrip} canEdit={canEdit}>
          {children}
        </TripProvider>
      </div>

      {/* Modals */}
      <MembersModal
        isOpen={showMembersModal}
        trip={trip}
        user={appUser}
        onClose={() => setShowMembersModal(false)}
        onTripUpdate={(
          tripId: string,
          updateFunction: (trip: Trip) => Trip
        ) => {
          updateTrip(updateFunction);
        }}
      />

      <InviteModal
        isOpen={showInviteModal}
        trip={trip}
        onClose={() => setShowInviteModal(false)}
      />

      <DeleteTripModal
        isOpen={showDeleteConfirm}
        trip={trip}
        deleteConfirmTitle={deleteConfirmTitle}
        onDeleteConfirmTitleChange={setDeleteConfirmTitle}
        onConfirmDelete={confirmDeleteTrip}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmTitle('');
        }}
      />

      <UserSettingsModal
        isOpen={showUserSettings}
        user={appUser}
        onClose={() => setShowUserSettings(false)}
        onUpdateUser={handleUpdateUserName}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Floating Navigation Menu */}
      <FloatingNavMenu
        navItems={navItems}
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
