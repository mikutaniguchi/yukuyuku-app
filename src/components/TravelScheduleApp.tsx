'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, LogOut, UserPlus, Settings, BookOpen, CheckSquare, DollarSign, FileText } from 'lucide-react';
import { User, Trip, PageType } from '@/types';
import { colorPalette, getDatesInRange, formatDate } from '@/lib/constants';
import LoginModal from './LoginModal';
import MembersModal from './MembersModal';
import InviteModal from './InviteModal';
import SchedulePage from './SchedulePage';
import MemoPage from './MemoPage';
import ChecklistPage from './ChecklistPage';
import BudgetPage from './BudgetPage';
import TagsPage from './TagsPage';
import FilesPage from './FilesPage';

// モックデータ
const initialTrips: Trip[] = [
  {
    id: 1,
    title: "東京旅行",
    startDate: "2024-08-01",
    endDate: "2024-08-03",
    creator: "user123",
    members: [
      { id: "user123", name: "あなた", type: "google", email: "you@example.com" },
      { id: "guest1", name: "田中さん", type: "guest" },
      { id: "guest2", name: "佐藤さん", type: "guest" }
    ],
    inviteCode: "TOKYO2024",
    memo: "宿泊先：東京ホテル\n緊急連絡先：090-1234-5678\n集合場所：東京駅丸の内中央口",
    schedules: {
      "2024-08-01": [
        {
          id: 1,
          time: "09:00",
          title: "東京駅集合",
          location: "東京駅丸の内中央口",
          description: "新幹線で到着後、みんなで合流",
          files: [],
          type: "meeting",
          budget: 0,
          budgetPeople: 1,
          transport: { method: "", duration: "", cost: 0 }
        },
        {
          id: 2,
          time: "12:00",
          title: "浅草観光",
          location: "浅草寺",
          description: "雷門から仲見世通りを歩いて浅草寺へ\nhttps://example.com/asakusa",
          files: [],
          type: "sightseeing",
          budget: 1500,
          budgetPeople: 3,
          transport: { method: "電車", duration: "30分", cost: 200 }
        }
      ]
    },
    customTags: [
      { id: "meeting", name: "集合", color: "bg-stone-200 text-stone-800" },
      { id: "sightseeing", name: "観光", color: "bg-emerald-200 text-emerald-800" },
      { id: "departure", name: "出発", color: "bg-rose-200 text-rose-800" },
      { id: "meal", name: "食事", color: "bg-amber-200 text-amber-800" }
    ],
    checklists: [
      {
        id: 1,
        name: "持ち物リスト",
        items: [
          { id: 1, text: "パスポート", checked: false },
          { id: 2, text: "財布", checked: false },
          { id: 3, text: "充電器", checked: true },
          { id: 4, text: "カメラ", checked: false }
        ]
      }
    ]
  }
];

export default function TravelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip>(trips[0]);
  const [selectedDate, setSelectedDate] = useState<string>("2024-08-01");
  const [currentPage, setCurrentPage] = useState<PageType>("schedule");
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navItems = [
    { id: "schedule" as const, label: "スケジュール", icon: Calendar },
    { id: "memo" as const, label: "旅行メモ", icon: BookOpen },
    { id: "checklist" as const, label: "チェックリスト", icon: CheckSquare },
    { id: "budget" as const, label: "予算管理", icon: DollarSign },
    { id: "files" as const, label: "ファイル", icon: FileText },
    { id: "tags" as const, label: "タグ設定", icon: Settings }
  ];

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLoginModal(true);
  };

  const updateTrip = (tripId: number, updateFunction: (trip: Trip) => Trip) => {
    setTrips(prevTrips => 
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedTrip = updateFunction(trip);
          if (selectedTrip.id === tripId) {
            setSelectedTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      })
    );
  };

  const hasAccess = user && selectedTrip.members.some(m => 
    (m.id === user.id) || (m.name === user.name && m.type === user.type)
  );

  // Auto-select first accessible trip
  useEffect(() => {
    if (user && trips.length > 0) {
      const userTrips = trips.filter(trip => 
        trip.members.some(m => m.id === user.id || (m.name === user.name && m.type === user.type))
      );
      if (userTrips.length > 0) {
        setSelectedTrip(userTrips[0]);
        setSelectedDate(getDatesInRange(userTrips[0].startDate, userTrips[0].endDate)[0]);
      }
    }
  }, [user, trips]);

  if (showLoginModal) {
    return <LoginModal onLogin={handleLogin} trips={trips} />;
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
      <div className="container mx-auto px-4 py-6">
        {/* User info bar */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm border border-stone-200 px-4 py-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
              style={{ backgroundColor: colorPalette.aquaBlue.light, color: colorPalette.aquaBlue.bg }}
            >
              {user?.name.charAt(0)}
            </div>
            <span className="font-medium text-stone-700">{user?.name}</span>
            {user?.type === 'google' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Google</span>
            )}
            {user?.type === 'guest' && (
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
            trip.members.some(m => m.id === user?.id || (m.name === user?.name && m.type === user?.type))
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
          user={user}
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