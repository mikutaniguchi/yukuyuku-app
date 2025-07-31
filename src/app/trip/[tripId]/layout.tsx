'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname, notFound } from 'next/navigation';
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
  LogOut,
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
import { logout } from '@/lib/auth';
import Button from '@/components/Button';
import MembersModal from '@/components/MembersModal';
import InviteModal from '@/components/InviteModal';
import DeleteTripModal from '@/components/DeleteTripModal';

interface TripLayoutProps {
  children: React.ReactNode;
}

export default function TripLayout({ children }: TripLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user: firebaseUser } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTripTitle, setEditingTripTitle] = useState(false);
  const [tempTripTitle, setTempTripTitle] = useState('');
  const [showTripSettings, setShowTripSettings] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');

  const tripId = params.tripId as string;

  const navItems = [
    {
      id: 'schedule',
      path: `/trip/${tripId}`,
      label: 'スケジュール',
      icon: Calendar,
    },
    {
      id: 'checklist',
      path: `/trip/${tripId}/checklist`,
      label: 'チェックリスト',
      icon: CheckSquare,
    },
    {
      id: 'files',
      path: `/trip/${tripId}/files`,
      label: 'ファイル',
      icon: FileText,
    },
    { id: 'memo', path: `/trip/${tripId}/memo`, label: 'メモ', icon: BookOpen },
    {
      id: 'budget',
      path: `/trip/${tripId}/budget`,
      label: '予算管理',
      icon: DollarSign,
    },
  ];

  useEffect(() => {
    const loadTrip = async () => {
      if (!firebaseUser || !tripId) {
        setLoading(false);
        return;
      }

      try {
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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center">
        <div className="text-stone-600">読み込み中...</div>
      </div>
    );
  }

  if (!trip || !firebaseUser) {
    return null;
  }

  const appUser: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'ユーザー',
    email: firebaseUser.email || '',
    type: 'google',
  };

  const isCreator = trip.creator === appUser.id;
  const canEdit = trip.members.some((m) => m.id === appUser.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
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
              {appUser.name.charAt(0)}
            </div>
            <span className="font-medium text-stone-700">{appUser.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>

        {/* Trip selector - simplified for now */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-stone-600 hover:text-stone-800"
          >
            ← 旅行一覧に戻る
          </Link>
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
                    {trip.title}
                  </h1>
                  {canEdit && (
                    <div className="relative">
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
    </div>
  );
}
