'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { User, Trip } from '@/types';
import { colorPalette } from '../lib/constants';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginModalProps {
  onLogin: (user: User) => void;
  trips: Trip[];
}

export default function LoginModal({ onLogin, trips }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user: User = {
        id: result.user.uid,
        name: result.user.displayName || "ユーザー",
        email: result.user.email || "",
        type: "google"
      };
      onLogin(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    }
  };


  const handleGuestReLogin = (memberName: string) => {
    const member = trips[0]?.members.find(m => m.name === memberName && m.type === "guest");
    if (member) {
      const guestUser: User = {
        id: member.id,
        name: member.name,
        type: "guest"
      };
      onLogin(guestUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: colorPalette.aquaBlue.bg }} />
          <h1 className="text-2xl font-bold text-stone-800 mb-2">旅のスケジュール</h1>
          <p className="text-stone-600">友達と一緒に旅行計画を立てよう</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
            style={{ backgroundColor: colorPalette.aquaBlue.bg, color: colorPalette.aquaBlue.text }}
          >
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">G</span>
            </div>
            Googleアカウントでログイン
          </button>

          <div className="text-center text-sm text-stone-500 mt-6 p-4 bg-stone-50 rounded-lg">
            <p className="font-medium text-stone-700 mb-2">ゲスト参加について</p>
            <p>招待URLを受け取った方は、</p>
            <p>そのリンクから直接アクセスしてください</p>
          </div>
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