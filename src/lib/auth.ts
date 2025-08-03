import {
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const loginAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const isGuestUser = (user: User | null): boolean => {
  return user?.isAnonymous === true;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserDisplayName = async (newName: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('ユーザーがログインしていません');
    }

    await updateProfile(currentUser, {
      displayName: newName,
    });

    return currentUser;
  } catch (error) {
    console.error('Failed to update display name:', error);
    throw error;
  }
};

export const deleteCurrentUser = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('ユーザーがログインしていません');
    }

    if (currentUser.isAnonymous) {
      throw new Error('ゲストユーザーはアカウント削除できません');
    }

    await deleteUser(currentUser);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};
