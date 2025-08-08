'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { User } from '@/types';
import UserDropdown from './UserDropdown';
import UserSettingsModal from './UserSettingsModal';
import ThemeToggle from './ThemeToggle';
import { logout } from '@/lib/auth';

interface HeaderProps {
  user: User;
  tripId?: string;
  onSettingsClick?: () => void;
  onLogout?: () => void;
}

export default function Header({
  user,
  tripId,
  onSettingsClick,
  onLogout,
}: HeaderProps) {
  const router = useRouter();
  const [showUserSettings, setShowUserSettings] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await logout();
        router.push('/');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      setShowUserSettings(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        {tripId ? (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-stone-800 transition-colors rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-4 h-4" />
            旅行一覧に戻る
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserDropdown
            user={user}
            onSettingsClick={handleSettingsClick}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {showUserSettings && !onSettingsClick && (
        <UserSettingsModal
          isOpen={showUserSettings}
          onClose={() => setShowUserSettings(false)}
          user={user}
          onUpdateUser={async () => {}}
          onDeleteAccount={async () => {}}
        />
      )}
    </>
  );
}
