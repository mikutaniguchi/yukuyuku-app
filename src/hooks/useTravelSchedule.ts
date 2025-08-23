'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Trip } from '@/types';
import {
  getUserTrips,
  createTrip as createTripInFirestore,
  updateTrip as updateTripInFirestore,
  deleteTrip as deleteTripFromFirestore,
} from '@/lib/firestore';
import { collection, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDatesInRange } from '@/lib/constants';
import { generateInviteCode } from '@/utils/invite';

/**
 * TravelScheduleのメインロジックを管理する統合フック
 */
export function useTravelSchedule() {
  const { user: firebaseUser, loading: authLoading } = useAuth();

  // 認証状態
  const [appUser, setAppUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 旅行データ
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);

  // Firebase認証状態を監視
  useEffect(() => {
    if (!authLoading) {
      if (firebaseUser) {
        // ゲストユーザー（匿名認証）がホームページにアクセスした場合
        if (firebaseUser.isAnonymous && window.location.pathname === '/') {
          setShowLoginModal(true);
          setLoadingTrips(false);
          return;
        }

        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          type: firebaseUser.isAnonymous ? 'guest' : 'google',
        };
        setAppUser(userData);
        setShowLoginModal(false);
        loadUserTrips(firebaseUser.uid);
      } else {
        setAppUser(null);
        setTrips([]);
        setSelectedTrip(null);
        setShowLoginModal(true);
        setLoadingTrips(false);
      }
    }
  }, [firebaseUser, authLoading]);

  const loadUserTrips = async (userId: string) => {
    try {
      const userTrips = await getUserTrips(userId);
      setTrips(userTrips);
      if (userTrips.length === 0) {
        setShowCreateTripModal(true);
      } else {
        setSelectedTrip(userTrips[0]);
        setSelectedDate(
          getDatesInRange(userTrips[0].startDate, userTrips[0].endDate)[0]
        );
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleLogin = async (userData: User) => {
    setAppUser(userData);
    setShowLoginModal(false);

    // ゲストユーザーの場合、招待コードから旅行を選択
    if (userData.type === 'guest' && 'inviteCode' in userData) {
      const inviteCode = (userData as { inviteCode: string }).inviteCode;
      try {
        const q = query(
          collection(db, 'trips'),
          where('inviteCode', '==', inviteCode)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const tripData = snapshot.docs[0].data() as Omit<Trip, 'id'>;
          const trip: Trip = { ...tripData, id: snapshot.docs[0].id };

          setTrips([trip]);
          setSelectedTrip(trip);
          setSelectedDate(getDatesInRange(trip.startDate, trip.endDate)[0]);
        }
      } catch (error) {
        console.error('Failed to load guest trip:', error);
      }
    }
  };

  const handleCreateTrip = async (tripData: {
    title: string;
    startDate: string;
    endDate: string;
  }): Promise<void> => {
    if (!appUser) return;

    const tripId = doc(collection(db, 'trips')).id;

    const newTrip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
      title: tripData.title,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      creator: appUser.id,
      memberIds: [appUser.id],
      members: [appUser],
      inviteCode: generateInviteCode(),
      memo: '',
      schedules: {},
      checklists: [
        {
          id: Date.now().toString(),
          tripId: tripId,
          name: 'やること',
          items: [
            { id: `${Date.now()}_1`, text: 'ホテルの予約', checked: false },
            {
              id: `${Date.now()}_2`,
              text: '持ち物リストの作成',
              checked: false,
            },
          ],
        },
      ],
    };

    await createTripInFirestore(newTrip, tripId);
    const createdTrip = { ...newTrip, id: tripId } as Trip;
    setTrips([...trips, createdTrip]);
    setSelectedTrip(createdTrip);
    setSelectedDate(createdTrip.startDate);
    setShowCreateTripModal(false);
  };

  const updateTrip = async (
    tripId: string,
    updateFunction: (trip: Trip) => Trip
  ) => {
    // ローカル状態を更新
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
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
      const currentTrip = trips.find((trip) => trip.id === tripId);
      if (currentTrip) {
        const updatedTrip = updateFunction(currentTrip);
        await updateTripInFirestore(tripId, updatedTrip);
      }
    } catch (error) {
      console.error('Failed to update trip in Firestore:', error);
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      await deleteTripFromFirestore(tripId);
      const updatedTrips = trips.filter((trip) => trip.id !== tripId);
      setTrips(updatedTrips);

      if (updatedTrips.length > 0) {
        setSelectedTrip(updatedTrips[0]);
        setSelectedDate(
          getDatesInRange(updatedTrips[0].startDate, updatedTrips[0].endDate)[0]
        );
      } else {
        setSelectedTrip(null);
        setShowCreateTripModal(true);
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  };

  // 権限チェック
  const isGuestUser = appUser?.type === 'guest';
  const canEdit = !isGuestUser;
  const isCreator = (_tripId: string) => selectedTrip?.creator === appUser?.id;

  return {
    // 認証状態
    appUser,
    showLoginModal,
    setShowLoginModal,
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
  };
}
