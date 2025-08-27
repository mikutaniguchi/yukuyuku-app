'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import {
  joinTripByCode,
  getTripByInviteCode,
  getInviteInfo,
} from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { loginAsGuest } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { colorPalette } from '@/lib/constants';
import LoginModal from '@/components/LoginModal';
import { Button } from '@/components/buttons';
import SchedulePage from '@/components/SchedulePage';
import MemoPage from '@/components/MemoPage';
import ChecklistPage from '@/components/ChecklistPage';
import { User, Trip } from '@/types';

interface JoinPageClientProps {
  inviteCode: string;
}

export default function JoinPageClient({ inviteCode }: JoinPageClientProps) {
  const router = useRouter();
  const { user, isGuest, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<
    | 'loading'
    | 'success'
    | 'server-error'
    | 'access-denied'
    | 'not-found'
    | 'choose-access'
    | 'guest-viewing'
  >('loading');
  const [tripName, setTripName] = useState('');
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const handleInitialLoad = async () => {
      // Auth がまだローディング中の場合は何もしない
      if (authLoading) {
        return;
      }

      if (!inviteCode) {
        setStatus('not-found');
        return;
      }

      // ユーザーがいない場合は選択画面を表示
      if (!user) {
        setStatus('choose-access');
        return;
      }

      try {
        // 招待リンクの場合、まずjoinTripByCodeでメンバーになってからtripを取得
        const result = await joinTripByCode(user.uid, inviteCode);

        if (!result.success) {
          setStatus('not-found');
          return;
        }

        // メンバーになったのでtripデータを取得
        const trip = await getTripByInviteCode(inviteCode);

        if (trip) {
          setTripData(trip);
          setTripName(trip.title);
        }

        // ゲストユーザーの場合は直接閲覧
        if (isGuest) {
          setStatus('guest-viewing');
          return;
        }

        // 通常ユーザーの場合は成功画面を表示してからリダイレクト
        setStatus('success');
        // 少し長めに待機してFirestoreの更新を確実にする
        setTimeout(() => {
          router.push(`/trip/${result.tripId}`);
        }, 2000);
      } catch (error) {
        console.error('Failed to process invite:', error);
        // ネットワークエラーやFirestoreエラーはサーバーエラー
        setStatus('server-error');
      }
    };

    handleInitialLoad();
  }, [user, isGuest, inviteCode, router, tripData, authLoading]);

  const handleMemberJoin = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import(
        'firebase/auth'
      );
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user: User = {
        id: result.user.uid,
        name: result.user.displayName || 'ユーザー',
        email: result.user.email || '',
        type: 'google',
      };

      await handleLogin(user);
    } catch (error) {
      console.error('Google login failed:', error);
      setStatus('server-error');
    }
  };

  const handleGuestAccess = async () => {
    try {
      // ゲストとして認証
      await loginAsGuest();

      // 招待コードを検証
      if (!inviteCode) {
        setStatus('not-found');
        return;
      }

      // 招待コードの検証
      const inviteInfo = await getInviteInfo(inviteCode);
      if (!inviteInfo) {
        setStatus('not-found');
        return;
      }

      const trip = await getTripByInviteCode(inviteCode);
      if (!trip) {
        setStatus('not-found');
        return;
      }

      setTripData(trip);
      setTripName(trip.title);
      setSelectedDate(trip.startDate); // 初期日付を設定

      // ゲストとして招待ページで閲覧開始
      setStatus('guest-viewing');
    } catch (error) {
      console.error('Failed to access as guest:', error);
      setStatus('server-error');
    }
  };

  const handleLogin = async (user: User) => {
    setShowLogin(false);
    // ログイン後、メンバーとして参加
    try {
      if (!inviteCode) {
        setStatus('not-found');
        return;
      }

      const result = await joinTripByCode(user.id, inviteCode);
      if (result.success) {
        setStatus('success');
        // 少し長めに待機してFirestoreの更新を確実にする
        setTimeout(() => {
          router.push(`/trip/${result.tripId}`);
        }, 1500);
      } else {
        setStatus('not-found');
      }
    } catch {
      setStatus('server-error');
    }
  };

  if (showLogin) {
    return <LoginModal onLogin={handleLogin} allowGuestAccess={true} />;
  }

  // 招待リンクが無効な場合は404ページへリダイレクト
  if (status === 'not-found') {
    router.push('/not-found');
    return null;
  }

  // サーバーエラーの場合
  if (status === 'server-error') {
    router.push('/error');
    return null;
  }

  // アクセス拒否の場合
  if (status === 'access-denied') {
    router.push('/access-denied');
    return null;
  }

  if (status === 'guest-viewing' && tripData && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
        <div className="bg-stone-100 p-4 text-center border-b border-stone-200">
          <p className="text-sm text-stone-600">
            「{tripName}」をゲストとして閲覧中
          </p>
          <p className="text-xs text-stone-500 mt-1">閲覧のみ可能です</p>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="space-y-8">
            <SchedulePage
              trip={tripData}
              onTripUpdate={() => {}}
              canEdit={false}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <MemoPage trip={tripData} onTripUpdate={() => {}} canEdit={false} />
            <ChecklistPage
              trip={tripData}
              onTripUpdate={() => {}}
              canEdit={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-stone-800 mb-4">
              参加処理中...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600 mx-auto"></div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-stone-800 mb-4">
              参加完了！
            </h1>
            <p className="text-stone-600 mb-4">「{tripName}」に参加しました</p>
            <p className="text-sm text-stone-500">
              2秒後に旅行ページに移動します...
            </p>
          </>
        )}

        {status === 'choose-access' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <Calendar
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: colorPalette.aquaBlue.bg }}
              />
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                旅行への招待
              </h1>
              <p className="text-stone-600">参加方法を選択してください</p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={handleMemberJoin}
                  color="aquaBlue"
                  size="lg"
                  fullWidth
                >
                  <span className="text-xl font-bold text-white">G</span>
                  メンバーとしてGoogleログイン
                </Button>
                <p className="text-xs text-stone-500 mt-1">編集・管理が可能</p>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleGuestAccess}
                  color="sandRed"
                  size="lg"
                  fullWidth
                >
                  ゲスト
                </Button>
                <p className="text-xs text-stone-500 mt-1">
                  ログイン不要・閲覧のみ
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
