import { User } from '@/types';

/**
 * ユーザーが編集権限を持っているかチェック
 */
export function canUserEdit(user: User | null): boolean {
  if (!user) return false;
  return user.type !== 'guest';
}

/**
 * ユーザーが旅行の作成者かチェック
 */
export function isUserCreator(user: User | null, creatorId: string): boolean {
  if (!user) return false;
  return user.id === creatorId;
}

/**
 * ゲストユーザーかチェック
 */
export function isGuestUser(user: User | null): boolean {
  if (!user) return false;
  return user.type === 'guest';
}

/**
 * 認証済みユーザーかチェック
 */
export function isAuthenticatedUser(user: User | null): boolean {
  if (!user) return false;
  return user.type === 'google';
}
