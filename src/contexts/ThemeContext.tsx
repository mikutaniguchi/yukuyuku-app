'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorPalette } from '@/types';
import { colorPalette, darkColorPalette } from '@/lib/constants';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // システムのテーマを検出
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  // テーマを解決（system の場合はシステムのテーマを使用）
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme as 'light' | 'dark';
  };

  // 初回レンダリング時にローカルストレージから設定を読み込み
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      setResolvedTheme(resolveTheme(savedTheme));
    } else {
      // 保存されたテーマがない場合、システムテーマをデフォルトに設定
      const systemTheme = getSystemTheme();
      setTheme(systemTheme);
      setResolvedTheme(systemTheme);
    }
  }, [resolveTheme]);

  // テーマが変更されたときの処理
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // ローカルストレージに保存
    localStorage.setItem('theme', theme);

    // HTMLにダークモードクラスを追加/削除
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // システムテーマの変更を監視
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // 古いブラウザ対応
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, resolveTheme]);

  const colors = resolvedTheme === 'dark' ? darkColorPalette : colorPalette;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
