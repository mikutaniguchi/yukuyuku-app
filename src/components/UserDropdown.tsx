'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { User } from '@/types';
import { colorPalette } from '@/lib/constants';

interface UserDropdownProps {
  user: User;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function UserDropdown({
  user,
  onSettingsClick,
  onLogout,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    onSettingsClick();
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ユーザー情報ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          style={{
            backgroundColor: colorPalette.aquaBlue.light,
            color: colorPalette.aquaBlue.bg,
          }}
        >
          {user.name.charAt(0)}
        </div>
        <span className="font-medium text-stone-700">{user.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-stone-200 rounded-lg shadow-lg z-50">
          {/* ユーザー情報ヘッダー */}
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  backgroundColor: colorPalette.aquaBlue.light,
                  color: colorPalette.aquaBlue.bg,
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-stone-800">{user.name}</div>
                <div className="text-sm text-stone-500">
                  {user.email || '未設定'}
                </div>
              </div>
            </div>
          </div>

          {/* メニュー項目 */}
          <div className="py-2">
            <button
              onClick={handleSettingsClick}
              className="w-full px-4 py-2 text-left hover:bg-stone-50 transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4 text-stone-500" />
              <span className="text-stone-700">アカウント設定</span>
            </button>

            <div className="border-t border-stone-100 my-1" />

            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2 text-left hover:bg-stone-50 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4 text-stone-500" />
              <span className="text-stone-700">ログアウト</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
