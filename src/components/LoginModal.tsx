'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { User } from '@/types';
import { colorPalette } from '../lib/constants';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginAsGuest } from '@/lib/auth';
import { Button } from './buttons';
import ErrorMessage from './ErrorMessage';

interface LoginModalProps {
  onLogin: (user: User) => void;
  allowGuestAccess?: boolean;
}

export default function LoginModal({
  onLogin,
  allowGuestAccess = false,
}: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user: User = {
        id: result.user.uid,
        name: result.user.displayName || 'ユーザー',
        email: result.user.email || '',
        type: 'google',
      };
      onLogin(user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'ログインに失敗しました'
      );
    }
  };

  const handleGuestLogin = async () => {
    try {
      const firebaseUser = await loginAsGuest();
      const user: User = {
        id: firebaseUser.uid,
        name: 'ゲスト',
        email: '',
        type: 'guest',
      };
      onLogin(user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'ゲストログインに失敗しました'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Calendar
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: colorPalette.aquaBlue.bg }}
          />
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            旅のスケジュール
          </h1>
          <p className="text-stone-600">友達と一緒に旅行計画を立てよう</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            color="aquaBlue"
            size="lg"
            fullWidth
          >
            <span className="text-xl font-bold text-white">G</span>
            Googleアカウントでログイン
          </Button>

          {allowGuestAccess && (
            <Button
              onClick={handleGuestLogin}
              variant="outlined"
              color="sandRed"
              size="lg"
              fullWidth
            >
              ゲストとして閲覧
            </Button>
          )}
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}
      </div>
    </div>
  );
}
