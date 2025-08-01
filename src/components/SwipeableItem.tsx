'use client';

import React, { useState, useRef } from 'react';

interface SwipeableItemProps {
  itemId: string;
  onSwipe: (itemId: string) => void;
  children: React.ReactNode;
}

export default function SwipeableItem({
  itemId,
  onSwipe,
  children,
}: SwipeableItemProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startX;
    if (deltaX < 0 && deltaX > -100) {
      setCurrentX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (currentX < -50) {
      onSwipe(itemId);
    }
    setCurrentX(0);
    setIsSwiping(false);
  };

  return (
    <div
      ref={itemRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${currentX}px)`,
        transition: isSwiping ? 'none' : 'transform 0.2s',
      }}
    >
      {children}
    </div>
  );
}
