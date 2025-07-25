// lib/constants.ts
import React from 'react';
import { Utensils, Car, Plane, TrainFront, Bus, Camera, Bed } from 'lucide-react';
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
  
  // 行ごとに分割してマークダウン見出しとURLを処理
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // マークダウン見出しの処理
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const headingClass = {
        1: 'text-2xl font-bold text-stone-800 mt-6 mb-3',
        2: 'text-xl font-semibold text-stone-800 mt-5 mb-2',
        3: 'text-lg font-medium text-stone-800 mt-4 mb-2'
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

export const generateInviteLink = (tripId: string, inviteCode: string): string => {
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

export const getIcon = (icon?: string) => {
  if (!icon) return null;
  switch (icon) {
    case 'meal': return <Utensils className="w-4 h-4" />;
    case 'car': return <Car className="w-4 h-4" />;
    case 'plane': return <Plane className="w-4 h-4" />;
    case 'train': return <TrainFront className="w-4 h-4" />;
    case 'bus': return <Bus className="w-4 h-4" />;
    case 'camera': return <Camera className="w-4 h-4" />;
    case 'bed': return <Bed className="w-4 h-4" />;
    default: return null;
  }
};