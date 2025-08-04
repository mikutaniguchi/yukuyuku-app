'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Database } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

// 環境変数から開発者のメールアドレスリストを取得
// const DEVELOPER_EMAILS = process.env.NEXT_PUBLIC_DEVELOPER_EMAILS
//   ? process.env.NEXT_PUBLIC_DEVELOPER_EMAILS.split(',')
//   : [];

export default function DatabaseSchemaPage() {
  const router = useRouter();
  // const { user, loading } = useAuth();

  // 認証チェックを一時的に無効化（面談用）
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-stone-600">読み込み中...</div>
  //     </div>
  //   );
  // }

  // if (!user || !DEVELOPER_EMAILS.includes(user.email || '')) {
  //   router.push('/');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => router.push('/docs')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          ドキュメントに戻る
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database
              className="w-8 h-8"
              style={{ color: colorPalette.aquaBlue.bg }}
            />
            <h1 className="text-3xl font-bold text-stone-800">
              データベーススキーマ
            </h1>
          </div>

          <div className="prose prose-stone max-w-none">
            <h2>データベース全体図</h2>
            <div className="bg-slate-50 p-8 rounded-xl mb-8 border border-slate-300 shadow-sm">
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold text-slate-800 mb-2">
                  Firestore Database
                </h4>
                <p className="text-slate-600">yukuyuku-app のデータ構造</p>
              </div>

              {/* メインリレーション図 */}
              <div className="flex flex-col lg:flex-row justify-center items-start gap-8 mb-8">
                {/* Trips Collection */}
                <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-300 min-w-[280px]">
                  <div className="text-center mb-4">
                    <div className="font-bold text-slate-800 text-xl">
                      trips
                    </div>
                    <div className="text-sm text-slate-600">旅行管理</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-slate-50 p-2 rounded">id: 旅行ID</div>
                    <div className="bg-slate-50 p-2 rounded">
                      title: タイトル
                    </div>
                    <div className="bg-slate-50 p-2 rounded">dates: 期間</div>
                    <div className="bg-blue-100 p-2 rounded font-medium">
                      memberIds: [メンバーID]
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      creator: 作成者ID
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      inviteCode: 招待コード
                    </div>
                  </div>
                </div>

                {/* 関連線とラベル */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow-md">
                      <div className="font-semibold text-slate-800">
                        リレーション
                      </div>
                      <div className="text-sm text-slate-700 mt-2">
                        trips.memberIds
                        <br />
                        ↕<br />
                        users.id
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        1つの旅行に複数のユーザーが参加
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Collection */}
                <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-300 min-w-[280px]">
                  <div className="text-center mb-4">
                    <div className="font-bold text-slate-800 text-xl">
                      users
                    </div>
                    <div className="text-sm text-slate-600">ユーザー情報</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-blue-100 p-2 rounded font-medium">
                      id: ユーザーID
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      email: メールアドレス
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      displayName: 表示名
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      photoURL: プロフィール画像
                    </div>
                  </div>
                </div>
              </div>

              {/* 下部のコンテンツ構造 */}
              <div className="pt-8 border-t border-slate-300">
                <h5 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                  trips コレクション内の主要コンテンツ
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">
                        schedules
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        日付別スケジュール
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        files, budget, transport含む
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">
                        members
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        メンバー詳細配列
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        memberIdsと連動
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">
                        checklists
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        チェックリスト配列
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        アイテムと完了状態
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">
                        customTags
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        カスタムタグ
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        色付きラベル
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2>データ構造</h2>

            <pre className="bg-stone-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`trips/
  └── {tripId}
      ├── id: string
      ├── title: string
      ├── startDate: string (YYYY-MM-DD)
      ├── endDate: string (YYYY-MM-DD)
      ├── creator: string (userId)
      ├── memberIds: string[] (ユーザーIDの配列)
      ├── members: Member[] (メンバー詳細の配列)
      ├── inviteCode: string (招待コード)
      ├── memo: string (旅行メモ)
      ├── schedules: Record<string, Schedule[]> (日付別スケジュール)
      │   └── "2024-03-15": [
      │       {
      │         id: string,
      │         title: string,
      │         location: string,
      │         startTime: string,
      │         endTime?: string,
      │         description: string,
      │         files: UploadedFile[],
      │         budget: number,
      │         budgetPeople: number,
      │         paidBy?: string,
      │         transport: { method: string, duration: string, cost: number },
      │         icon?: string
      │       }
      │   ]
      ├── customTags: CustomTag[] (カスタムタグ)
      │   └── { id: string, name: string, color: string }
      ├── checklists: Checklist[] (チェックリスト)
      │   └── { id: string, name: string, items: ChecklistItem[] }
      ├── guestAccessEnabled?: boolean (ゲストアクセス許可)
      ├── createdAt?: Date | string
      └── updatedAt?: Date | string`}
            </pre>

            <h2>型定義</h2>

            <h3>Trip</h3>
            <pre className="bg-stone-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`interface Trip {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  creator: string; // userId
  memberIds: string[]; // userId配列
  members: Member[];
  inviteCode: string;
  memo: string;
  schedules: Record<string, Schedule[]>; // 日付別
  customTags: CustomTag[];
  checklists: Checklist[];
}`}
            </pre>

            <h3>Schedule</h3>
            <pre className="bg-stone-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`interface Schedule {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime?: string;
  description: string;
  files: UploadedFile[];
  budget: number;
  transport: Transport;
}`}
            </pre>

            <h3>Member</h3>
            <pre className="bg-stone-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`interface Member {
  id: string;
  name: string;
  type: 'google' | 'guest' | 'email';
  email?: string;
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
