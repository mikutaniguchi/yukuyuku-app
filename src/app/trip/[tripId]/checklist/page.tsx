'use client';

import React from 'react';
import { Trip } from '@/types';
import { useTrip } from '@/contexts/TripContext';
import ChecklistPage from '@/components/ChecklistPage';

export default function ChecklistRoutePage() {
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
    <ChecklistPage
      trip={trip}
      onTripUpdate={canEdit ? handleTripUpdate : () => {}}
      canEdit={canEdit}
    />
  );
}
