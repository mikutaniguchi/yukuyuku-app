'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserTrips, joinTripByCode } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading');
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    const handleJoin = async () => {
      if (!user || !params.code) {
        setStatus('error');
        return;
      }

      try {
        const code = Array.isArray(params.code) ? params.code[0] : params.code;
        const result = await joinTripByCode(user.uid, code);
        
        if (result.success) {
          setTripName(result.tripName || '');
          setStatus('success');
          // 3秒後にホームに戻る
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('not-found');
        }
      } catch (error) {
        console.error('Failed to join trip:', error);
        setStatus('error');
      }
    };

    handleJoin();
  }, [user, params.code, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">ログインが必要です</h1>
          <p className="text-stone-600 mb-6">旅行に参加するにはログインしてください</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-stone-800 mb-4">参加処理中...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">参加完了！</h1>
            <p className="text-stone-600 mb-4">
              「{tripName}」に参加しました
            </p>
            <p className="text-sm text-stone-500">3秒後にホームに戻ります...</p>
          </>
        )}

        {status === 'not-found' && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">招待コードが見つかりません</h1>
            <p className="text-stone-600 mb-6">
              招待コードが無効または期限切れの可能性があります
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ホームに戻る
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
            <p className="text-stone-600 mb-6">
              しばらく時間をおいて再度お試しください
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ホームに戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
}