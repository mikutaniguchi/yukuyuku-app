import ErrorPage from '@/components/ErrorPage';

export default function AccessDenied() {
  return (
    <ErrorPage
      title="403"
      subtitle="アクセスが拒否されました"
      message="このページにアクセスする権限がありません。"
      showHomeButton={true}
      showLinks={true}
    />
  );
}
