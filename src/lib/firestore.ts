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
  return tripRef.id;
};

export const getTrip = async (tripId: string) => {
  const tripDoc = await getDoc(doc(db, 'trips', tripId));
  if (tripDoc.exists()) {
    return { id: tripDoc.id, ...tripDoc.data() } as Trip;
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
    await updateDoc(doc(db, 'trips', trip.id), {
      memberIds: updatedMemberIds,
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
