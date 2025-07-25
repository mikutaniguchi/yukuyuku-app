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
  name: string;
  type: 'google' | 'guest';
  email?: string;
}

export interface Transport {
  method: string;
  duration: string;
  cost: number;
}

export interface Schedule {
  id: number;
  time: string;
  title: string;
  location: string;
  description: string;
  files: UploadedFile[];
  type: string;
  budget: number;
  budgetPeople: number;
  transport: Transport;
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
  id: number;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: number;
  name: string;
  items: ChecklistItem[];
}

export interface Trip {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  creator: string;
  members: Member[];
  inviteCode: string;
  memo: string;
  schedules: Record<string, Schedule[]>;
  customTags: CustomTag[];
  checklists: Checklist[];
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

export type LoginMode = 'select' | 'google' | 'guest';
export type PageType = 'schedule' | 'memo' | 'checklist' | 'budget' | 'files' | 'tags';