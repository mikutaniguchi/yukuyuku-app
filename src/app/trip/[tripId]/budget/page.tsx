'use client';

import React from 'react';
import { useTrip } from '@/contexts/TripContext';
import BudgetPage from '@/components/BudgetPage';

export default function BudgetRoutePage() {
  const { trip } = useTrip();

  if (!trip) {
    return null;
  }

  return <BudgetPage trip={trip} />;
}
