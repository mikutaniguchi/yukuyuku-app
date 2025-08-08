// lib/constants.ts
import React from 'react';
import {
  Utensils,
  Car,
  Plane,
  TrainFront,
  Bus,
  School,
  Bed,
} from 'lucide-react';
import { ColorPalette } from '../types';

export const colorPalette: ColorPalette = {
  abyssGreen: {
    bg: '#7D8470',
    text: '#FFFFFF',
    light: '#A8B198',
    lightText: '#4D5142',
  },
  sandRed: {
    bg: '#AB8686',
    text: '#FFFFFF',
    light: '#D4B4B4',
    lightText: '#6B4444',
  },
  roseQuartz: {
    bg: '#8A7A8D',
    text: '#FFFFFF',
    light: '#CDB7CC',
    lightText: '#6A586A',
  },
  aquaBlue: {
    bg: '#738A94',
    text: '#FFFFFF',
    light: '#C4D6DC',
    lightText: '#5A7B86',
  },
  strawBeige: {
    bg: '#A89373',
    text: '#FFFFFF',
    light: '#D9CDB4',
    lightText: '#5A4D35',
  },
};

export const darkColorPalette: ColorPalette = {
  abyssGreen: {
    bg: '#5a6350',
    text: '#FFFFFF',
    light: '#40453A',
    lightText: '#B8C5A8',
  },
  sandRed: {
    bg: '#4A3534', // 元の#AB8686を暗く
    text: '#D4B4B4', // lightカラーをテキストに
    light: '#5D4342', // 少し明るめの背景
    lightText: '#AB8686', // 元のbgカラーをアクセントに
  },
  roseQuartz: {
    bg: '#423A42',
    text: '#CDB7CC',
    light: '#4D434C',
    lightText: '#AA98A9',
  },
  aquaBlue: {
    bg: '#3A464C',
    text: '#C4D6DC',
    light: '#445055',
    lightText: '#A4C0C9',
  },
  strawBeige: {
    bg: '#3D352B',
    text: '#D9CDB4',
    light: '#52473A',
    lightText: '#A89373',
  },
};

// lib/utils.ts
export const getDatesInRange = (
  startDate: string,
  endDate: string
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }
  return dates;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
};

export const linkifyText = (text: string) => {
  if (!text) return text;

  // 行ごとに分割してマークダウン見出しとURLを処理
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // マークダウン見出しの処理
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const headingClass =
        {
          1: 'text-2xl font-bold text-stone-800 mt-6 mb-3',
          2: 'text-xl font-semibold text-stone-800 mt-5 mb-2',
          3: 'text-lg font-medium text-stone-800 mt-4 mb-2',
        }[level] || 'text-lg font-medium text-stone-800 mt-4 mb-2';

      return (
        <div key={lineIndex} className={headingClass}>
          {processUrls(content)}
        </div>
      );
    }

    // 通常のテキスト行の処理
    return (
      <div key={lineIndex}>
        {processUrls(line)}
        {lineIndex < lines.length - 1 && <br />}
      </div>
    );
  });
};

// URLのリンク化処理を分離
const processUrls = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-700 hover:text-stone-900 underline break-all overflow-wrap-anywhere"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateInviteLink = (
  tripId: string,
  inviteCode: string
): string => {
  // クライアントサイドでのみ window.location を使用
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/join/${inviteCode}`;
  }
  return `https://travel-app.com/join/${inviteCode}`;
};

export const getGoogleMapsLink = (location: string): string | null => {
  if (!location) return null;

  // すでにGoogleマップのURLの場合はそのまま返す
  if (
    location.includes('maps.google.com') ||
    location.includes('goo.gl/maps') ||
    location.includes('maps.app.goo.gl')
  ) {
    return location;
  }

  // 通常の場所名の場合はGoogleマップの検索URLを生成
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
};

export const getIcon = (icon?: string) => {
  if (!icon) return null;
  switch (icon) {
    case 'meal':
      return <Utensils className="w-4 h-4" />;
    case 'car':
      return <Car className="w-4 h-4" />;
    case 'plane':
      return <Plane className="w-4 h-4" />;
    case 'train':
      return <TrainFront className="w-4 h-4" />;
    case 'bus':
      return <Bus className="w-4 h-4" />;
    case 'camera':
      return <School className="w-4 h-4" />;
    case 'bed':
      return <Bed className="w-4 h-4" />;
    default:
      return null;
  }
};
