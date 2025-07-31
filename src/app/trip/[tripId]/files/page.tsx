'use client';

import React from 'react';
import { useTrip } from '@/contexts/TripContext';
import FilesPage from '@/components/FilesPage';

export default function FilesRoutePage() {
  const { trip } = useTrip();

  if (!trip) {
    return null;
  }

  return <FilesPage trip={trip} />;
}
