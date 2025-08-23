/**
 * 招待コードを生成
 */
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * 招待URLを生成
 */
export function generateInviteUrl(inviteCode: string): string {
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : '';
  return `${baseUrl}/join/${inviteCode}`;
}

/**
 * 招待コードのバリデーション
 */
export function isValidInviteCode(code: string): boolean {
  if (!code) return false;
  // 6文字の英数字大文字
  return /^[A-Z0-9]{6}$/.test(code);
}
