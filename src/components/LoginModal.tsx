'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { User } from '@/types';
import { colorPalette } from '../lib/constants';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginAsGuest } from '@/lib/auth';

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
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
            style={{
              backgroundColor: colorPalette.aquaBlue.bg,
              color: colorPalette.aquaBlue.text,
            }}
          >
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">G</span>
            </div>
            Googleアカウントでログイン
          </button>

          {allowGuestAccess && (
            <>
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-stone-300"></div>
                <span className="px-3 text-sm text-stone-500">または</span>
                <div className="flex-1 border-t border-stone-300"></div>
              </div>

              <button
                onClick={handleGuestLogin}
                className="w-full py-3 px-4 rounded-lg font-medium transition-colors border-2 border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                ゲストとして閲覧
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
