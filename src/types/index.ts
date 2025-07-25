// types/index.ts
export interface User {
  id: string;
  name: string;
  email?: string;
  type: 'google' | 'guest';
  avatar?: string;
}

export interface Member {
  id: string;
  tripId?: string;
  userId?: string;
  name: string;
  type: 'google' | 'guest' | 'email';
  email?: string;
  joinedAt?: Date | string;
}

export interface Transport {
  method: string;
  duration: string;
  cost: number;
}

export interface Schedule {
  id: string;
  tripId: string;
  date: string;
  startTime: string;
  endTime?: string;
  title: string;
  location: string;
  description: string;
  files: UploadedFile[];
  type: string;
  budget: number;
  budgetPeople: number;
  transport: Transport;
  createdAt?: Date | string;
}

export interface UploadedFile {
  id: string | number;
  name: string;
  type: string;
  url: string;
}

export interface CustomTag {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  tripId: string;
  name: string;
  items: ChecklistItem[];
  checked?: boolean;
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  creator: string;
  memberIds: string[];
  members: Member[];
  inviteCode: string;
  memo: string;
  schedules: Record<string, Schedule[]>;
  customTags: CustomTag[];
  checklists: Checklist[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ColorPalette {
  sandRed: ColorVariant;
  rubyGrey: ColorVariant;
  roseQuartz: ColorVariant;
  aquaBlue: ColorVariant;
  abyssGreen: ColorVariant;
  strawBeige: ColorVariant;
}

export interface ColorVariant {
  bg: string;
  text: string;
  light: string;
  lightText: string;
}

export interface Memo {
  id: string;
  tripId: string;
  title: string;
  content: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Tag {
  id: string;
  tripId: string;
  name: string;
  color: string;
}

export interface Budget {
  id: string;
  tripId: string;
  category: string;
  amount: number;
  paidBy: string;
  sharedWith: string[];
  date: string;
  description?: string;
}

export type LoginMode = 'select' | 'google' | 'guest' | 'email';
export type PageType = 'schedule' | 'memo' | 'checklist' | 'budget' | 'files' | 'tags';