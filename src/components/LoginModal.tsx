'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { User, Trip, LoginMode } from '@/types';
import { colorPalette } from '../lib/constants';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface LoginModalProps {
  onLogin: (user: User) => void;
  trips: Trip[];
}

export default function LoginModal({ onLogin, trips }: LoginModalProps) {
  const [loginMode, setLoginMode] = useState<LoginMode>('select');
  const [guestName, setGuestName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
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

  const handleGuestLogin = () => {
    if (!guestName.trim()) return;
    
    // Check for invite code
    if (inviteCode) {
      const trip = trips.find(t => t.inviteCode === inviteCode.toUpperCase());
      if (trip) {
        const guestUser: User = {
          id: `guest_${Date.now()}`,
          name: guestName,
          type: "guest"
        };
        onLogin(guestUser);
        return;
      }
    }
    
    // Regular guest login
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: guestName,
      type: "guest"
    };
    onLogin(guestUser);
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

        {loginMode === 'select' && (
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
            
            <button
              onClick={() => setLoginMode('guest')}
              className="w-full py-3 px-4 border-2 border-stone-300 rounded-lg font-medium text-stone-700 hover:border-stone-400 transition-colors"
            >
              ゲストとして参加
            </button>

            <div className="text-center text-sm text-stone-500 mt-6">
              <p>招待リンクをお持ちの方は</p>
              <p>「ゲストとして参加」を選択してください</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loginMode === 'guest' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                お名前
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                招待コード（任意）
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="例: TOKYO2024"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>

            {trips.length > 0 && trips[0].members.filter(m => m.type === 'guest').length > 0 && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">
                  または既存のメンバーを選択
                </p>
                <div className="space-y-2">
                  {trips[0].members.filter(m => m.type === 'guest').map(member => (
                    <button
                      key={member.id}
                      onClick={() => handleGuestReLogin(member.name)}
                      className="w-full py-2 px-3 text-left border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors text-stone-700"
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGuestLogin}
              disabled={!guestName.trim()}
              className="w-full py-3 px-4 rounded-lg font-medium text-white disabled:bg-stone-400 transition-colors"
              style={{ backgroundColor: guestName.trim() ? colorPalette.roseQuartz.bg : undefined }}
            >
              参加する
            </button>

            <button
              onClick={() => setLoginMode('select')}
              className="w-full py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              ← 戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}