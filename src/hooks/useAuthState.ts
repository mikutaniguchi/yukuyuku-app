'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';

interface UseAuthStateReturn {
  appUser: User | null;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  isGuestUser: boolean;
  handleAuthStateChange: () => void;
}

/**
 * 認証状態を管理するカスタムフック
 * Firebase認証状態をアプリケーション用のUser型に変換し、
 * ゲストユーザーのアクセス制御を行う
 */
export function useAuthState(
  firebaseUser: FirebaseUser | null,
  loading: boolean
): UseAuthStateReturn {
  const [appUser, setAppUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (firebaseUser) {
        // ゲストユーザー（匿名認証）がホームページにアクセスした場合
        if (firebaseUser.isAnonymous && window.location.pathname === '/') {
          setShowLoginModal(true);
          setAppUser(null);
          return;
        }

        // 通常のユーザー設定
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'ユーザー',
          email: firebaseUser.email || '',
          type: firebaseUser.isAnonymous ? 'guest' : 'google',
        };
        setAppUser(userData);
        setShowLoginModal(false);
      } else {
        // 未認証の場合
        setAppUser(null);
        setShowLoginModal(true);
      }
    }
  }, [firebaseUser, loading]);

  const isGuestUser = appUser?.type === 'guest';

  const handleAuthStateChange = () => {
    // 認証状態が変更された際の処理
    setAppUser(null);
    setShowLoginModal(true);
  };

  return {
    appUser,
    showLoginModal,
    setShowLoginModal,
    isGuestUser,
    handleAuthStateChange,
  };
}
