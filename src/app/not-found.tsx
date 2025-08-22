import ErrorPage from '@/components/ErrorPage';

export default function NotFound() {
  return (
    <ErrorPage
      title="404"
      subtitle="ページが見つかりません"
      showHomeButton={true}
      showLinks={true}
    />
  );
}
