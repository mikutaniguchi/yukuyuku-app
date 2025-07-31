'use client';

import React, { createContext, useContext } from 'react';
import { Trip } from '@/types';

interface TripContextType {
  trip: Trip | null;
  updateTrip: (updateFunction: (trip: Trip) => Trip) => Promise<void>;
  canEdit: boolean;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{
  children: React.ReactNode;
  trip: Trip | null;
  updateTrip: (updateFunction: (trip: Trip) => Trip) => Promise<void>;
  canEdit: boolean;
}> = ({ children, trip, updateTrip, canEdit }) => {
  return (
    <TripContext.Provider value={{ trip, updateTrip, canEdit }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
