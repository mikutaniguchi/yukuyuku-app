'use client';

import React, { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { getDatesInRange } from '@/lib/constants';
import { useTrip } from '@/contexts/TripContext';
import SchedulePage from '@/components/SchedulePage';

export default function TripPage() {
  const { trip, updateTrip, canEdit } = useTrip();
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (trip) {
      const dates = getDatesInRange(trip.startDate, trip.endDate);
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    }
  }, [trip]);

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
    <SchedulePage
      trip={trip}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onTripUpdate={canEdit ? handleTripUpdate : () => {}}
      canEdit={canEdit}
    />
  );
}
