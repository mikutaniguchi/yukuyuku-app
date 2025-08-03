import { Metadata } from 'next';
import { generateInviteMetadata } from '@/lib/metadata';
import JoinPageClient from './join-page-client';

interface PageProps {
  params: Promise<{ code: string }>;
}

// OGP用のメタデータ生成（サーバーコンポーネント）
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  return generateInviteMetadata(code);
}

// メインページ（サーバーコンポーネント）
export default async function JoinPage({ params }: PageProps) {
  const { code } = await params;
  return <JoinPageClient inviteCode={code} />;
}
