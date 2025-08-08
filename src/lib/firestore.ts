import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';
import { Trip, Schedule, Checklist, Memo, Tag, Member, Budget } from '@/types';

// Trips
export const createTrip = async (
  trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const tripRef = doc(collection(db, 'trips'));
  const tripData = {
    ...trip,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(tripRef, tripData);

  // invitesコレクションにもタイトルを保存（OGP用）
  if (trip.inviteCode) {
    const inviteRef = doc(db, 'invites', trip.inviteCode);
    await setDoc(inviteRef, {
      tripTitle: trip.title,
      createdAt: serverTimestamp(),
    });
  }

  return tripRef.id;
};

export const getTrip = async (tripId: string) => {
  const tripDoc = await getDoc(doc(db, 'trips', tripId));
  if (tripDoc.exists()) {
    const trip = { id: tripDoc.id, ...tripDoc.data() } as Trip;

    // memberIdsとmembersの同期チェック
    const memberIds = trip.memberIds || [];
    const members = trip.members || [];
    const memberIdsInMembers = members.map((m) => m.id);

    // memberIdsにあるがmembersにないメンバーを見つける
    const missingMemberIds = memberIds.filter(
      (id) => !memberIdsInMembers.includes(id)
    );

    if (missingMemberIds.length > 0) {
      // 不足しているメンバー情報を追加
      const missingMembers = missingMemberIds.map((id, index) => ({
        id: id,
        tripId: trip.id,
        userId: id,
        name:
          id === trip.creator
            ? '作成者'
            : `参加者 ${members.length + index + 1}`,
        email: '',
        type: 'google' as const,
        joinedAt: trip.createdAt || new Date().toISOString(),
      }));

      const updatedMembers = [...members, ...missingMembers];

      // Firestoreを更新
      try {
        await updateDoc(doc(db, 'trips', tripId), {
          members: updatedMembers,
          updatedAt: serverTimestamp(),
        });

        return { ...trip, members: updatedMembers };
      } catch (error) {
        console.error('Failed to update members:', error);
        return trip;
      }
    }

    return trip;
  }
  return null;
};

export const getUserTrips = async (userId: string) => {
  const q = query(
    collection(db, 'trips'),
    where('memberIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Trip);
};

export const getTripByInviteCode = async (inviteCode: string) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('inviteCode', '==', inviteCode)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const tripDoc = snapshot.docs[0];
    return { id: tripDoc.id, ...tripDoc.data() } as Trip;
  } catch (error) {
    console.error('Failed to get trip by invite code:', error);
    return null;
  }
};

// 招待コードから旅行タイトルを取得（OGP用、認証不要）
export const getInviteInfo = async (inviteCode: string) => {
  if (!inviteCode) {
    return null;
  }

  try {
    // invitesコレクションのみを確認（認証不要）
    const inviteDoc = await getDoc(doc(db, 'invites', inviteCode));

    if (inviteDoc.exists()) {
      return inviteDoc.data() as {
        tripTitle: string;
        createdAt: ReturnType<typeof serverTimestamp>;
      };
    }

    // invitesコレクションにデータがない場合はnullを返す
    console.log('Invite document not found for code:', inviteCode);
    return null;
  } catch (error) {
    console.error('Failed to get invite info:', error);
    return null;
  }
};

export const joinTripByCode = async (userId: string, inviteCode: string) => {
  try {
    // 招待コードで旅行を検索
    const q = query(
      collection(db, 'trips'),
      where('inviteCode', '==', inviteCode)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Trip not found' };
    }

    const tripDoc = snapshot.docs[0];
    const trip = { id: tripDoc.id, ...tripDoc.data() } as Trip;

    // 既にメンバーかチェック
    if (trip.memberIds.includes(userId)) {
      return {
        success: true,
        tripName: trip.title,
        tripId: trip.id,
        alreadyMember: true,
      };
    }

    // メンバーに追加
    const updatedMemberIds = [...trip.memberIds, userId];

    // メンバー情報を取得（Googleログインユーザーの場合）
    const auth = getAuth();
    const currentUser = auth.currentUser;
    let newMember;

    if (currentUser && !currentUser.isAnonymous) {
      newMember = {
        id: userId,
        tripId: trip.id,
        userId: userId,
        name: currentUser.displayName || 'ユーザー',
        email: currentUser.email || '',
        type: 'google' as const,
        joinedAt: new Date().toISOString(),
      };
    } else {
      // 匿名ユーザーまたは不明なユーザーの場合
      newMember = {
        id: userId,
        tripId: trip.id,
        userId: userId,
        name: 'ユーザー',
        email: '',
        type: 'email' as const,
        joinedAt: new Date().toISOString(),
      };
    }

    // 既存のメンバー配列を取得し、作成者が含まれていない場合は追加
    let currentMembers = trip.members || [];

    // 作成者がメンバー配列にいるかチェック
    const creatorInMembers = currentMembers.some((m) => m.id === trip.creator);
    if (!creatorInMembers) {
      // 作成者の情報を追加（可能な限り情報を取得）
      const creatorMember = {
        id: trip.creator,
        tripId: trip.id,
        userId: trip.creator,
        name: '作成者', // 実際の名前は取得できないので暫定
        email: '',
        type: 'google' as const,
        joinedAt: trip.createdAt || new Date().toISOString(),
      };
      currentMembers = [creatorMember, ...currentMembers];
    }

    const updatedMembers = [...currentMembers, newMember];

    await updateDoc(doc(db, 'trips', trip.id), {
      memberIds: updatedMemberIds,
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    return { success: true, tripName: trip.title, tripId: trip.id };
  } catch (error) {
    console.error('Error joining trip:', error);
    return { success: false, error: 'Failed to join trip' };
  }
};

export const updateTrip = async (tripId: string, tripData: Partial<Trip>) => {
  const tripRef = doc(db, 'trips', tripId);

  // タイトルが変更された場合、invitesコレクションも更新
  if (tripData.title) {
    const currentTrip = await getDoc(tripRef);
    if (currentTrip.exists() && currentTrip.data().inviteCode) {
      const inviteRef = doc(db, 'invites', currentTrip.data().inviteCode);
      const inviteDoc = await getDoc(inviteRef);
      if (inviteDoc.exists()) {
        await updateDoc(inviteRef, {
          tripTitle: tripData.title,
        });
      } else {
        // inviteドキュメントが存在しない場合は作成
        await setDoc(inviteRef, {
          tripTitle: tripData.title,
          createdAt: serverTimestamp(),
        });
      }
    }
  }

  await updateDoc(tripRef, {
    ...tripData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTrip = async (tripId: string) => {
  const tripRef = doc(db, 'trips', tripId);
  await deleteDoc(tripRef);
};

// Schedules
export const createSchedule = async (schedule: Omit<Schedule, 'id'>) => {
  const scheduleRef = doc(collection(db, 'schedules'));
  await setDoc(scheduleRef, {
    ...schedule,
    createdAt: serverTimestamp(),
  });
  return scheduleRef.id;
};

export const getTripSchedules = async (tripId: string) => {
  const q = query(
    collection(db, 'schedules'),
    where('tripId', '==', tripId),
    orderBy('date', 'asc'),
    orderBy('startTime', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Schedule
  );
};

// Checklists
export const createChecklistItem = async (item: Omit<Checklist, 'id'>) => {
  const itemRef = doc(collection(db, 'checklists'));
  await setDoc(itemRef, item);
  return itemRef.id;
};

export const getTripChecklists = async (tripId: string) => {
  const q = query(collection(db, 'checklists'), where('tripId', '==', tripId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Checklist
  );
};

export const updateChecklistItem = async (itemId: string, checked: boolean) => {
  await updateDoc(doc(db, 'checklists', itemId), { checked });
};

// Memos
export const createMemo = async (
  memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const memoRef = doc(collection(db, 'memos'));
  await setDoc(memoRef, {
    ...memo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return memoRef.id;
};

export const getTripMemos = async (tripId: string) => {
  const q = query(
    collection(db, 'memos'),
    where('tripId', '==', tripId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Memo);
};

// Tags
export const createTag = async (tag: Omit<Tag, 'id'>) => {
  const tagRef = doc(collection(db, 'tags'));
  await setDoc(tagRef, tag);
  return tagRef.id;
};

export const getTripTags = async (tripId: string) => {
  const q = query(collection(db, 'tags'), where('tripId', '==', tripId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Tag);
};

// Members
export const addMember = async (
  tripId: string,
  member: Omit<Member, 'id' | 'joinedAt'>
) => {
  const memberRef = doc(collection(db, 'members'));
  await setDoc(memberRef, {
    ...member,
    tripId,
    joinedAt: serverTimestamp(),
  });
  return memberRef.id;
};

export const getTripMembers = async (tripId: string) => {
  const q = query(collection(db, 'members'), where('tripId', '==', tripId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Member);
};

// Budget
export const createBudgetItem = async (item: Omit<Budget, 'id'>) => {
  const budgetRef = doc(collection(db, 'budgets'));
  await setDoc(budgetRef, item);
  return budgetRef.id;
};

export const getTripBudgets = async (tripId: string) => {
  const q = query(collection(db, 'budgets'), where('tripId', '==', tripId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Budget);
};

// ユーザー名を全ての関連旅行で更新
export const updateUserNameInAllTrips = async (
  userId: string,
  newName: string
) => {
  try {
    // ユーザーが参加している全旅行を取得
    const userTrips = await getUserTrips(userId);

    // 各旅行のメンバー情報を更新
    const updatePromises = userTrips.map(async (trip) => {
      const updatedMembers = trip.members.map((member) =>
        member.id === userId ? { ...member, name: newName } : member
      );

      return updateDoc(doc(db, 'trips', trip.id), {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
    });

    await Promise.all(updatePromises);

    return { success: true, updatedTrips: userTrips.length };
  } catch (error) {
    console.error('Failed to update user name in trips:', error);
    throw error;
  }
};

// ユーザーを全ての関連旅行から削除
export const removeUserFromAllTrips = async (userId: string) => {
  try {
    // ユーザーが参加している全旅行を取得
    const userTrips = await getUserTrips(userId);

    // 各旅行からユーザーを削除
    const updatePromises = userTrips.map(async (trip) => {
      const updatedMemberIds = trip.memberIds.filter((id) => id !== userId);
      const updatedMembers = trip.members.filter(
        (member) => member.id !== userId
      );

      // 作成者の場合は旅行自体を削除
      if (trip.creator === userId) {
        return deleteDoc(doc(db, 'trips', trip.id));
      } else {
        return updateDoc(doc(db, 'trips', trip.id), {
          memberIds: updatedMemberIds,
          members: updatedMembers,
          updatedAt: serverTimestamp(),
        });
      }
    });

    await Promise.all(updatePromises);

    return { success: true, updatedTrips: userTrips.length };
  } catch (error) {
    console.error('Failed to remove user from trips:', error);
    throw error;
  }
};
