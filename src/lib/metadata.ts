import { Metadata } from 'next';

// 招待ページ用のOGPメタデータ生成
export async function generateInviteMetadata(
  inviteCode: string
): Promise<Metadata> {
  // TODO: Admin SDKを使用してサーバーサイドでFirestoreアクセスを実装
  // 現在はクライアントSDKのためサーバーサイドでエラーが発生

  console.log('generateInviteMetadata called for:', inviteCode);

  // 一時的にフォールバックのみ使用
  return generateDefaultInviteMetadata();

  /* 将来のAdmin SDK実装用コード
  try {
    const inviteInfo = await getInviteInfo(inviteCode);

    if (inviteInfo) {
      const title = `${inviteInfo.tripTitle}への招待`;
      const description =
        '友達があなたを旅行計画に招待しています。リンクをクリックして参加しましょう！';

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: ['/icon.png'],
          type: 'website',
          siteName: 'ゆくゆく',
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

  return generateDefaultInviteMetadata();
  */
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
