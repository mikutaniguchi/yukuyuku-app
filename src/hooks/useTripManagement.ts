'use client';

import { useState } from 'react';
import { User, Trip } from '@/types';
import {
  getUserTrips,
  createTrip,
  updateTrip as updateTripInFirestore,
  deleteTrip as deleteTripFromFirestore,
} from '@/lib/firestore';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDatesInRange } from '@/lib/constants';

interface UseTripManagementReturn {
  trips: Trip[];
  selectedTrip: Trip | null;
  selectedDate: string;
  loadingTrips: boolean;
  showCreateTripModal: boolean;
  setShowCreateTripModal: (show: boolean) => void;
  setSelectedTrip: (trip: Trip | null) => void;
  setSelectedDate: (date: string) => void;
  loadUserTrips: (userId: string) => Promise<void>;
  handleCreateTrip: (
    tripData: { title: string; startDate: string; endDate: string },
    user: User
  ) => Promise<void>;
  updateTrip: (
    tripId: string,
    updateFunction: (trip: Trip) => Trip
  ) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
}

/**
 * 旅行データの管理を行うカスタムフック
 */
export function useTripManagement(): UseTripManagementReturn {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);

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

  const handleCreateTrip = async (
    tripData: { title: string; startDate: string; endDate: string },
    user: User
  ): Promise<void> => {
    if (!user) return;

    const tripId = doc(collection(db, 'trips')).id;

    const newTrip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
      title: tripData.title,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      creator: user.id,
      memberIds: [user.id],
      members: [user],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
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

    await createTrip(newTrip as Omit<Trip, 'id'>, tripId);
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

  return {
    trips,
    selectedTrip,
    selectedDate,
    loadingTrips,
    showCreateTripModal,
    setShowCreateTripModal,
    setSelectedTrip,
    setSelectedDate,
    loadUserTrips,
    handleCreateTrip,
    updateTrip,
    deleteTrip,
  };
}
