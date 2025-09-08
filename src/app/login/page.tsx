'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import LoadingScreen from '@/components/LoadingScreen';

export default function LoginPage() {
  const router = useRouter();
  const { user: firebaseUser, loading, isGuest } = useAuth();

  useEffect(() => {
    if (!loading && firebaseUser && !isGuest) {
      router.push('/');
    }
  }, [firebaseUser, loading, isGuest, router]);

  const handleLogin = async () => {
    router.push('/');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (firebaseUser && !isGuest) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center">
      <LoginModal onLogin={handleLogin} />
    </div>
  );
}
