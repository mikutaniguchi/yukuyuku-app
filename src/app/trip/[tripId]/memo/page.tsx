'use client';

import React from 'react';
import { Trip } from '@/types';
import { useTrip } from '@/contexts/TripContext';
import MemoPage from '@/components/MemoPage';

export default function MemoRoutePage() {
  const { trip, updateTrip, canEdit } = useTrip();

  if (!trip || !updateTrip) {
    return null;
  }

  const handleTripUpdate = (
    tripId: string,
    updateFunction: (trip: Trip) => Trip
  ) => {
    updateTrip(updateFunction);
  };

  return (
    <MemoPage
      trip={trip}
      onTripUpdate={canEdit ? handleTripUpdate : () => {}}
      canEdit={canEdit}
    />
  );
}
