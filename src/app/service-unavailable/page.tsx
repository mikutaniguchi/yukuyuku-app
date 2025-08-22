import ErrorPage from '@/components/ErrorPage';

export default function ServiceUnavailable() {
  return (
    <ErrorPage
      title="503"
      subtitle="サービス一時停止中"
      message="現在メンテナンス中です。しばらくお待ちください。"
      showHomeButton={true}
      showLinks={false}
    />
  );
}
