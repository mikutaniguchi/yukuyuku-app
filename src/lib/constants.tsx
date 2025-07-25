// lib/constants.ts
import { ColorPalette } from '../types';

export const colorPalette: ColorPalette = {
  sandRed: { bg: '#AB8686', text: '#FFFFFF', light: '#D4B4B4', lightText: '#6B4444' },
  rubyGrey: { bg: '#C7A2A2', text: '#FFFFFF', light: '#E1C7C7', lightText: '#7A5A5A' },
  roseQuartz: { bg: '#AA98A9', text: '#FFFFFF', light: '#CDB7CC', lightText: '#6A586A' },
  aquaBlue: { bg: '#A4C0C9', text: '#FFFFFF', light: '#C4D6DC', lightText: '#5A7B86' },
  abyssGreen: { bg: '#7D8470', text: '#FFFFFF', light: '#A8B198', lightText: '#4D5142' },
  strawBeige: { bg: '#C3B091', text: '#6B5B42', light: '#D9CDB4', lightText: '#5A4D35' }
};

// lib/utils.ts
export const getDatesInRange = (startDate: string, endDate: string): string[] => {
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
          className="text-blue-600 hover:text-blue-800 underline break-all"
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

export const generateInviteLink = (tripId: number, inviteCode: string): string => {
  // クライアントサイドでのみ window.location を使用
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/join/${inviteCode}`;
  }
  return `https://travel-app.com/join/${inviteCode}`;
};

export const getGoogleMapsLink = (location: string): string | null => {
  if (!location) return null;
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/search?q=${encodedLocation}`;
};