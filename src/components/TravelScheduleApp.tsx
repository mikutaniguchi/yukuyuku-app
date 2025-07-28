'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';
import { createTrip as createTripInFirestore, getUserTrips, updateTrip as updateTripInFirestore, deleteTrip as deleteTripFromFirestore } from '@/lib/firestore';
import { Calendar, Users, Plus, LogOut, UserPlus, Settings, BookOpen, CheckSquare, DollarSign, FileText, Edit2, Trash2, Save, X, Aperture } from 'lucide-react';
import { User, Trip, PageType } from '@/types';
import { colorPalette, getDatesInRange, formatDate } from '@/lib/constants';
import LoginModal from './LoginModal';
import MembersModal from './MembersModal';
import InviteModal from './InviteModal';
import CreateTripModal from './CreateTripModal';
import DeleteTripModal from './DeleteTripModal';
import SchedulePage from './SchedulePage';
import MemoPage from './MemoPage';
import ChecklistPage from './ChecklistPage';
import BudgetPage from './BudgetPage';
import FilesPage from './FilesPage';
import Button from './Button';

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
  const [editingTripTitle, setEditingTripTitle] = useState(false);
  const [tempTripTitle, setTempTripTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');
  const [showTripSettings, setShowTripSettings] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "schedule" as const, label: "スケジュール", icon: Calendar },
    { id: "checklist" as const, label: "チェックリスト", icon: CheckSquare },
    { id: "files" as const, label: "ファイル", icon: FileText },
    { id: "memo" as const, label: "メモ", icon: BookOpen },
    { id: "budget" as const, label: "予算管理", icon: DollarSign }
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
        customTags: [],
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
      await deleteTripFromFirestore(selectedTrip.id);
      const updatedTrips = trips.filter(trip => trip.id !== selectedTrip.id);
      setTrips(updatedTrips);
      
      if (updatedTrips.length > 0) {
        setSelectedTrip(updatedTrips[0]);
        setSelectedDate(getDatesInRange(updatedTrips[0].startDate, updatedTrips[0].endDate)[0]);
      } else {
        setSelectedTrip(null);
        setShowCreateTripModal(true);
      }
      
      setShowDeleteConfirm(false);
      setDeleteConfirmTitle('');
    } catch (error) {
      console.error('Failed to delete trip:', error);
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
        title: tempTripTitle.trim()
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

  // Handle scroll detection for floating menu
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 200); // Show after 200px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowTripSettings(false);
      }
      
      // Also close floating menu when clicking outside
      if (!event.target || !(event.target as Element).closest('.floating-menu')) {
        setShowFloatingMenu(false);
      }
    };

    if (showTripSettings || showFloatingMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTripSettings, showFloatingMenu]);

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
      return <CreateTripModal isOpen={showCreateTripModal} onCreateTrip={handleCreateTrip} />;
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-4">旅行がありません</h2>
          <p className="text-stone-600 mb-6">新しい旅行を作成して始めましょう</p>
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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-4">アクセス権限がありません</h2>
          <p className="text-stone-600 mb-6">この旅行にアクセスするには招待が必要です</p>
          <Button
            onClick={handleLogout}
            color="sandRed"
            size="md"
          >
            ログイン画面に戻る
          </Button>
        </div>
      </div>
    );
  }

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
              style={{ backgroundColor: colorPalette.aquaBlue.light, color: colorPalette.aquaBlue.bg }}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8" style={{ color: colorPalette.aquaBlue.bg }} />
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
                  <h1 className="text-xl md:text-3xl font-bold text-stone-800">{selectedTrip.title}</h1>
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
                        <button
                          onClick={handleDeleteTrip}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          旅行を削除
                        </button>
                      </div>
                    )}
                  </div>
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
      </div>

      {/* Modals */}
      <MembersModal 
        isOpen={showMembersModal}
        trip={selectedTrip}
        user={appUser}
        onClose={() => setShowMembersModal(false)}
        onTripUpdate={updateTrip}
      />

      <InviteModal 
        isOpen={showInviteModal}
        trip={selectedTrip}
        onClose={() => setShowInviteModal(false)}
      />

      <DeleteTripModal
        isOpen={showDeleteConfirm}
        trip={selectedTrip}
        deleteConfirmTitle={deleteConfirmTitle}
        onDeleteConfirmTitleChange={setDeleteConfirmTitle}
        onConfirmDelete={confirmDeleteTrip}
        onCancel={cancelDeleteTrip}
      />

      {/* Floating Navigation Menu */}
      {isScrolled && (
        <div className="floating-menu fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Menu Items */}
            {showFloatingMenu && (
              <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-stone-200 py-2 w-48 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const colors = Object.values(colorPalette);
                  const color = colors[index % colors.length];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setShowFloatingMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors ${
                        currentPage === item.id ? 'bg-stone-100' : ''
                      }`}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        style={{ color: currentPage === item.id ? color.bg : '#6B7280' }}
                      />
                      <span className={`font-medium ${
                        currentPage === item.id ? 'text-stone-800' : 'text-stone-600'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Floating Button */}
            <button
              onClick={() => setShowFloatingMenu(!showFloatingMenu)}
              className="w-14 h-14 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-800 hover:shadow-xl transition-all duration-300"
            >
              {showFloatingMenu ? (
                <Aperture className="w-6 h-6 rotate-90 scale-125 transition-transform duration-300" />
              ) : (
                <Aperture className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}