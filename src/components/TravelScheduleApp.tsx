'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';
import { createTrip as createTripInFirestore, getUserTrips, updateTrip as updateTripInFirestore } from '@/lib/firestore';
import { Calendar, Users, Plus, LogOut, UserPlus, Settings, BookOpen, CheckSquare, DollarSign, FileText } from 'lucide-react';
import { User, Trip, PageType } from '@/types';
import { colorPalette, getDatesInRange, formatDate } from '@/lib/constants';
import LoginModal from './LoginModal';
import MembersModal from './MembersModal';
import InviteModal from './InviteModal';
import CreateTripModal from './CreateTripModal';
import SchedulePage from './SchedulePage';
import MemoPage from './MemoPage';
import ChecklistPage from './ChecklistPage';
import BudgetPage from './BudgetPage';
import TagsPage from './TagsPage';
import FilesPage from './FilesPage';

// モックデータ（初期は空）
const initialTrips: Trip[] = [];

export default function TravelApp() {
  const { user: firebaseUser, loading } = useAuth();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<PageType>("schedule");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const navItems = [
    { id: "schedule" as const, label: "スケジュール", icon: Calendar },
    { id: "memo" as const, label: "旅行メモ", icon: BookOpen },
    { id: "checklist" as const, label: "チェックリスト", icon: CheckSquare },
    { id: "budget" as const, label: "予算管理", icon: DollarSign },
    { id: "files" as const, label: "ファイル", icon: FileText },
    { id: "tags" as const, label: "タグ設定", icon: Settings }
  ];

  // Firebase認証状態を監視
  useEffect(() => {
    if (!loading) {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "ユーザー",
          email: firebaseUser.email || "",
          type: "google"
        };
        setAppUser(userData);
        setShowLoginModal(false);
        loadUserTrips(firebaseUser.uid);
      } else {
        setShowLoginModal(true);
        setLoadingTrips(false);
      }
    }
  }, [firebaseUser, loading]);

  const loadUserTrips = async (userId: string) => {
    try {
      const userTrips = await getUserTrips(userId);
      setTrips(userTrips);
      if (userTrips.length === 0) {
        setShowCreateTripModal(true);
      } else {
        setSelectedTrip(userTrips[0]);
        setSelectedDate(getDatesInRange(userTrips[0].startDate, userTrips[0].endDate)[0]);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleLogin = (userData: User) => {
    setAppUser(userData);
    setShowLoginModal(false);
    
    // 新規Googleユーザーの場合、旅行作成フォームを表示
    if (userData.type === 'google' && !trips.some(trip => 
      trip.members.some(m => m.id === userData.id)
    )) {
      setShowCreateTripModal(true);
    }
  };

  const handleCreateTrip = async (tripData: { title: string; startDate: string; endDate: string }) => {
    if (!appUser) return;
    
    try {
      const newTrip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        title: tripData.title,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        creator: appUser.id,
        memberIds: [appUser.id],
        members: [appUser],
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        memo: "",
        schedules: {},
        customTags: [
          { id: "meeting", name: "集合", color: "bg-stone-200 text-stone-800" },
          { id: "sightseeing", name: "観光", color: "bg-emerald-200 text-emerald-800" },
          { id: "departure", name: "出発", color: "bg-rose-200 text-rose-800" },
          { id: "meal", name: "食事", color: "bg-amber-200 text-amber-800" }
        ],
        checklists: []
      };
      
      const tripId = await createTripInFirestore(newTrip);
      const createdTrip = { ...newTrip, id: tripId } as Trip;
      setTrips([...trips, createdTrip]);
      setSelectedTrip(createdTrip);
      setSelectedDate(createdTrip.startDate);
      setShowCreateTripModal(false);
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAppUser(null);
      setTrips([]);
      setSelectedTrip(null);
      setShowLoginModal(true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateTrip = async (tripId: string, updateFunction: (trip: Trip) => Trip) => {
    // ローカル状態を更新
    setTrips(prevTrips => 
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedTrip = updateFunction(trip);
          if (selectedTrip?.id === tripId) {
            setSelectedTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      })
    );

    // Firestoreを更新
    try {
      const currentTrip = trips.find(trip => trip.id === tripId);
      if (currentTrip) {
        const updatedTrip = updateFunction(currentTrip);
        await updateTripInFirestore(tripId, updatedTrip);
      }
    } catch (error) {
      console.error('Failed to update trip in Firestore:', error);
    }
  };

  const hasAccess = appUser && selectedTrip && selectedTrip.members.some(m => 
    (m.id === appUser.id) || (m.name === appUser.name && m.type === appUser.type)
  );

  // Auto-select first accessible trip
  useEffect(() => {
    if (appUser && trips.length > 0) {
      const userTrips = trips.filter(trip => 
        trip.members.some(m => m.id === appUser.id || (m.name === appUser.name && m.type === appUser.type))
      );
      if (userTrips.length > 0) {
        setSelectedTrip(userTrips[0]);
        setSelectedDate(getDatesInRange(userTrips[0].startDate, userTrips[0].endDate)[0]);
      }
    }
  }, [appUser, trips]);

  if (loading || loadingTrips) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center">
        <div className="text-stone-600">読み込み中...</div>
      </div>
    );
  }

  if (showLoginModal) {
    return <LoginModal onLogin={handleLogin} trips={trips} />;
  }

  // 旅行がない場合は作成フォームを表示
  if (!selectedTrip && appUser) {
    if (showCreateTripModal) {
      return <CreateTripModal onCreateTrip={handleCreateTrip} />;
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-4">旅行がありません</h2>
          <p className="text-stone-600 mb-6">新しい旅行を作成して始めましょう</p>
          <button
            onClick={() => setShowCreateTripModal(true)}
            className="px-6 py-2 text-white rounded-lg flex items-center gap-2 mx-auto"
            style={{ backgroundColor: colorPalette.abyssGreen.bg }}
          >
            <Plus className="w-5 h-5" />
            新しい旅行を作成
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-4">アクセス権限がありません</h2>
          <p className="text-stone-600 mb-6">この旅行にアクセスするには招待が必要です</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-white rounded-lg"
            style={{ backgroundColor: colorPalette.sandRed.bg }}
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      {showCreateTripModal && (
        <CreateTripModal 
          onCreateTrip={handleCreateTrip}
          onClose={() => setShowCreateTripModal(false)}
        />
      )}
      <div className="container mx-auto px-4 py-6">
        {/* User info bar */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm border border-stone-200 px-4 py-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
              style={{ backgroundColor: colorPalette.aquaBlue.light, color: colorPalette.aquaBlue.bg }}
            >
              {appUser?.name.charAt(0)}
            </div>
            <span className="font-medium text-stone-700">{appUser?.name}</span>
            {appUser?.type === 'google' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Google</span>
            )}
            {appUser?.type === 'guest' && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">ゲスト</span>
            )}
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
          {trips.filter(trip => 
            trip.members.some(m => m.id === appUser?.id || (m.name === appUser?.name && m.type === appUser?.type))
          ).map(trip => (
            <button
              key={trip.id}
              onClick={() => {
                setSelectedTrip(trip);
                setSelectedDate(getDatesInRange(trip.startDate, trip.endDate)[0]);
                setCurrentPage("schedule");
              }}
              className={`px-4 py-2 rounded-lg transition-colors shadow-sm font-medium ${
                selectedTrip.id === trip.id
                  ? 'text-white shadow-md'
                  : 'bg-white border border-stone-200 text-stone-700 hover:shadow-md hover:border-stone-300'
              }`}
              style={selectedTrip.id === trip.id ? {
                backgroundColor: colorPalette.aquaBlue.bg,
                color: colorPalette.aquaBlue.text
              } : {}}
            >
              {trip.title}
            </button>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-stone-300 text-stone-600 rounded-lg hover:border-stone-400 hover:text-stone-700 transition-colors">
            <Plus className="w-4 h-4" />
            新しい旅行
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
              <Calendar className="w-8 h-8" style={{ color: colorPalette.aquaBlue.bg }} />
              {selectedTrip.title}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMembersModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors hover:shadow-md"
                style={{ 
                  backgroundColor: colorPalette.rubyGrey.bg,
                  color: colorPalette.rubyGrey.text 
                }}
              >
                <Users className="w-4 h-4" />
                メンバー
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-colors hover:shadow-md"
                style={{ 
                  backgroundColor: colorPalette.roseQuartz.bg,
                  color: colorPalette.roseQuartz.text 
                }}
              >
                <UserPlus className="w-4 h-4" />
                招待
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {selectedTrip.members.length}人参加
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
                style={currentPage === item.id ? {
                  backgroundColor: color.bg,
                  color: color.text
                } : {}}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Page Content */}
        {currentPage === "schedule" && (
          <SchedulePage 
            trip={selectedTrip} 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onTripUpdate={updateTrip}
          />
        )}
        {currentPage === "memo" && (
          <MemoPage trip={selectedTrip} onTripUpdate={updateTrip} />
        )}
        {currentPage === "checklist" && (
          <ChecklistPage trip={selectedTrip} onTripUpdate={updateTrip} />
        )}
        {currentPage === "budget" && (
          <BudgetPage trip={selectedTrip} />
        )}
        {currentPage === "files" && (
          <FilesPage trip={selectedTrip} />
        )}
        {currentPage === "tags" && (
          <TagsPage trip={selectedTrip} onTripUpdate={updateTrip} />
        )}
      </div>

      {/* Modals */}
      {showMembersModal && (
        <MembersModal 
          trip={selectedTrip}
          user={appUser}
          onClose={() => setShowMembersModal(false)}
          onTripUpdate={updateTrip}
        />
      )}

      {showInviteModal && (
        <InviteModal 
          trip={selectedTrip}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}