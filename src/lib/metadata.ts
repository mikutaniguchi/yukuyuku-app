import { Metadata } from 'next';
import { getTripByInviteCode } from './firestore';

// 招待ページ用のOGPメタデータ生成
export async function generateInviteMetadata(
  inviteCode: string
): Promise<Metadata> {
  try {
    const trip = await getTripByInviteCode(inviteCode);

    if (trip) {
      const title = `${trip.title}への招待`;
      const description = '友達があなたを旅行に招待しています';

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: [
            {
              url: '/icon.png',
              width: 512,
              height: 512,
              alt: 'Yukuyuku App',
            },
          ],
          type: 'website',
          siteName: 'Yukuyuku',
        },
        twitter: {
          card: 'summary',
          title,
          description,
          images: ['/icon.png'],
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate invite metadata:', error);
  }

  // フォールバック
  return generateDefaultInviteMetadata();
}

// デフォルトの招待メタデータ
export function generateDefaultInviteMetadata(): Metadata {
  const title = '旅行への招待';
  const description = '友達があなたを旅行に招待しています';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/icon.png'],
      type: 'website',
      siteName: 'Yukuyuku',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/icon.png'],
    },
  };
}

// 通常の旅行ページ用メタデータ（今後追加予定）
export async function generateTripMetadata(_tripId: string): Promise<Metadata> {
  // 将来的に旅行ページでも使えるように
  return {
    title: 'Yukuyuku - 旅行計画',
    description: '友達と一緒に旅行計画を立てよう',
  };
}
