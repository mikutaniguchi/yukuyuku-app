'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCurrentIcon = () => {
    const getColor = () => {
      if (isHovered) {
        return resolvedTheme === 'dark' ? '#f5f5f4' : '#1c1917';
      }
      return resolvedTheme === 'dark' ? '#9ca3af' : '#57534e';
    };

    if (theme === 'system') {
      return (
        <Monitor
          className="h-5 w-5 transition-colors"
          style={{ color: getColor() }}
        />
      );
    } else if (theme === 'dark') {
      return (
        <Moon
          className="h-5 w-5 transition-colors"
          style={{ color: getColor() }}
        />
      );
    } else {
      return (
        <Sun
          className="h-5 w-5 transition-colors"
          style={{ color: getColor() }}
        />
      );
    }
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'ライト',
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: 'dark',
      label: 'ダーク',
      icon: <Moon className="h-4 w-4" />,
    },
    {
      value: 'system',
      label: 'システム',
      icon: <Monitor className="h-4 w-4" />,
    },
  ];

  // クリック外側で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="テーマを選択"
      >
        {getCurrentIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg py-2 z-50">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                handleThemeChange(option.value as 'light' | 'dark' | 'system')
              }
              className="w-full flex items-center justify-between px-4 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="text-sm">{option.label}</span>
              </div>
              {theme === option.value && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
