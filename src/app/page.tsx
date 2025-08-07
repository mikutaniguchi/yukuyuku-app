'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserTrips,
  createTrip as createTripInFirestore,
} from '@/lib/firestore';
import { Trip, User } from '@/types';
import { Calendar, Plus } from 'lucide-react';
import { colorPalette, formatDate } from '@/lib/constants';
import LoginModal from '@/components/LoginModal';
import CreateTripModal from '@/components/CreateTripModal';
import Header from '@/components/Header';

export default function Home() {
  const router = useRouter();
  const { user: firebaseUser, loading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [appUser, setAppUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading) {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          type: 'google',
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
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleLogin = async (userData: User) => {
    setAppUser(userData);
    setShowLoginModal(false);
    if (userData.id) {
      loadUserTrips(userData.id);
    }
  };

  const handleCreateTrip = async (tripData: {
    title: string;
    startDate: string;
    endDate: string;
  }) => {
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
        memo: '',
        schedules: {},
        checklists: [],
      };

      const tripId = await createTripInFirestore(newTrip);
      const createdTrip = { ...newTrip, id: tripId } as Trip;
      setTrips([...trips, createdTrip]);
      setShowCreateTripModal(false);

      // 作成した旅行ページに遷移
      router.push(`/trip/${tripId}`);
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
  };

  if (loading || loadingTrips) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center">
        <div className="text-stone-600">読み込み中...</div>
      </div>
    );
  }

  if (showLoginModal) {
    return <LoginModal onLogin={handleLogin} allowGuestAccess={false} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        {appUser && <Header user={appUser} />}

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800">旅行一覧</h1>
        </div>

        {/* Trip List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => router.push(`/trip/${trip.id}`)}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar
                  className="w-8 h-8"
                  style={{ color: colorPalette.aquaBlue.bg }}
                />
                <h3 className="text-xl font-semibold text-stone-800">
                  {trip.title}
                </h3>
              </div>
              <div className="space-y-2 text-sm text-stone-600">
                <p>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <p>{trip.members.length}人参加</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowCreateTripModal(true)}
            className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-6 hover:border-stone-400 transition-colors flex flex-col items-center justify-center gap-4"
          >
            <Plus className="w-12 h-12 text-stone-400" />
            <span className="text-stone-600 font-medium">新しい旅行を作成</span>
          </button>
        </div>
      </div>

      <CreateTripModal
        isOpen={showCreateTripModal}
        onCreateTrip={handleCreateTrip}
        onClose={() => setShowCreateTripModal(false)}
      />
    </div>
  );
}
