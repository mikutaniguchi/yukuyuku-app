'use client';

import ErrorPage from '@/components/ErrorPage';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({}: ErrorPageProps) {
  return (
    <ErrorPage
      title="500"
      subtitle="サーバーエラーが発生しました"
      message="一時的な問題が発生している可能性があります。時間をおいて再度お試しください。"
      showHomeButton={true}
      showLinks={true}
    />
  );
}
