'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, List } from 'lucide-react';
import { colorPalette } from '@/lib/constants';

export default function FeaturesPage() {
  const router = useRouter();

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
            <List
              className="w-8 h-8"
              style={{ color: colorPalette.roseQuartz.bg }}
            />
            <h1 className="text-3xl font-bold text-stone-800">機能一覧</h1>
          </div>

          <div className="prose prose-stone max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">コア機能</h2>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">スケジュール管理</h3>
              <ul className="space-y-2 text-sm">
                <li>• 日付別のスケジュール作成・編集・削除</li>
                <li>• 日付未定のスケジュール管理（「未定」タブ）</li>
                <li>• カスタムアイコンと色で視覚的に分類</li>
                <li>• メンバー割り当て機能</li>
                <li>• メモ・URL・予算の追加</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">チェックリスト</h3>
              <ul className="space-y-2 text-sm">
                <li>• カテゴリー別のチェックリスト作成</li>
                <li>• チェック状態の記録と進捗表示</li>
                <li>• カテゴリーの追加・編集・削除</li>
                <li>• 項目の動的な追加・削除</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">ファイル管理</h3>
              <ul className="space-y-2 text-sm">
                <li>• 画像・PDFファイルのアップロード</li>
                <li>• 1MB以上の画像を自動圧縮（品質を保ちながらサイズ削減）</li>
                <li>• スケジュールごとのファイル管理</li>
                <li>• 画像ビューアー（拡大表示・スワイプ対応）</li>
                <li>• PDFビューアー（埋め込み表示）</li>
                <li>• Firebase Storageによる安全な保存</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">予算管理</h3>
              <ul className="space-y-2 text-sm">
                <li>• スケジュールごとの予算設定</li>
                <li>• 日付別の予算集計</li>
                <li>• 総予算の自動計算</li>
                <li>• メンバー別の予算集計</li>
                <li>• 予算サマリーの視覚的表示</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">日次メモ</h3>
              <ul className="space-y-2 text-sm">
                <li>• 日付ごとのメモ作成（宿泊情報など）</li>
                <li>• 複数日にまたがる表示設定（1〜7日間）</li>
                <li>• スケジュール上部に常時表示</li>
                <li>• メモの編集・削除</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              コラボレーション機能
            </h2>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">メンバー管理</h3>
              <ul className="space-y-2 text-sm">
                <li>• 招待リンクによる簡単なメンバー追加</li>
                <li>• Googleアカウント連携</li>
                <li>• ゲストモード（閲覧専用・ログイン不要）</li>
                <li>• メンバー一覧表示</li>
                <li>• 作成者による旅行削除権限</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">データ同期</h3>
              <ul className="space-y-2 text-sm">
                <li>• 自動保存（入力後即座に保存）</li>
                <li>• 手動リロードで他メンバーの変更を取得</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">ユーザビリティ機能</h2>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">PWA対応</h3>
              <ul className="space-y-2 text-sm">
                <li>• ホーム画面への追加</li>
                <li>• アプリライクな操作感</li>
                <li>• オフライン対応（Service Worker）</li>
                <li>• プッシュ通知対応（今後実装予定）</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">UI/UX</h3>
              <ul className="space-y-2 text-sm">
                <li>• レスポンシブデザイン（モバイル・タブレット・PC対応）</li>
                <li>• 直感的なタブナビゲーション</li>
                <li>• モーダルによる編集操作</li>
                <li>• 統一されたカラーパレット</li>
                <li>• アニメーション効果</li>
                <li>• ローディング表示</li>
                <li>• エラーハンドリング（404ページなど）</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">データ管理</h2>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">セキュリティ</h3>
              <ul className="space-y-2 text-sm">
                <li>• Firebase Authenticationによる認証</li>
                <li>• Firestoreセキュリティルールによるアクセス制御</li>
                <li>• 旅行ごとの独立したアクセス権限</li>
                <li>• ゲストセッションの自動削除</li>
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">データ永続化</h3>
              <ul className="space-y-2 text-sm">
                <li>• Firestoreによるクラウド保存</li>
                <li>• Firebase Storageによるファイル保存</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">今後の実装予定</h2>
            <div className="bg-stone-50 p-6 rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>• ドラッグ&ドロップによるスケジュール並び替え</li>
                <li>• しおり印刷機能</li>
                <li>• PDFのオフライン対応</li>
                <li>• ブックマーク機能</li>
                <li>• リアルタイム同期（複数人での同時編集対応）</li>
                <li>• データエクスポート（CSV/PDF）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
