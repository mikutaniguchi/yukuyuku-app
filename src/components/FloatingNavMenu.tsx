'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Aperture } from 'lucide-react';
import { colorPalette } from '@/lib/constants';
import { PageType } from '@/types';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FloatingNavMenuProps {
  navItems: NavItem[];
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  scrollThreshold?: number;
}

export default function FloatingNavMenu({
  navItems,
  currentPage,
  onPageChange,
  scrollThreshold = 200,
}: FloatingNavMenuProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  // Handle scroll detection for floating menu
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !event.target ||
        !(event.target as Element).closest('.floating-menu')
      ) {
        setShowFloatingMenu(false);
      }
    };

    if (showFloatingMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFloatingMenu]);

  if (!isScrolled) return null;

  return (
    <div className="floating-menu fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Menu Items */}
        {showFloatingMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-stone-200 py-2 w-48 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const colors = Object.values(colorPalette);
              const color = colors[index % colors.length];
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setShowFloatingMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors ${
                    currentPage === item.id ? 'bg-stone-100' : ''
                  }`}
                >
                  <div
                    className="w-5 h-5 flex items-center justify-center"
                    style={{
                      color: currentPage === item.id ? color.bg : '#6B7280',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`font-medium ${
                      currentPage === item.id
                        ? 'text-stone-800'
                        : 'text-stone-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className="w-14 h-14 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-800 hover:shadow-xl transition-all duration-300"
        >
          {showFloatingMenu ? (
            <Aperture className="w-6 h-6 rotate-90 scale-125 transition-transform duration-300" />
          ) : (
            <Aperture className="w-6 h-6 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
}
