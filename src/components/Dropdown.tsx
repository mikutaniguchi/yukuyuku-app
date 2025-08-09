'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check, LucideIcon } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon | ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string | ReactNode;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  showChevron?: boolean;
  showSelectedIcon?: boolean;
  position?: 'left' | 'right';
  width?: 'auto' | 'full' | string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Dropdown({
  options,
  value,
  placeholder = '選択してください',
  onChange,
  disabled = false,
  className = '',
  dropdownClassName = '',
  showChevron = true,
  showSelectedIcon = true,
  position = 'left',
  width = 'auto',
  size = 'md',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // サイズクラス
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const dropdownSizeClasses = {
    sm: 'py-1',
    md: 'py-2',
    lg: 'py-3',
  };

  // 幅クラス
  const getWidthClass = () => {
    if (width === 'full') return 'w-full';
    if (width === 'auto') return 'w-auto min-w-[120px]';
    return width;
  };

  // ポジションクラス
  const positionClass = position === 'right' ? 'right-0' : 'left-0';

  // 選択されたオプションを取得
  const selectedOption = options.find((option) => option.value === value);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const renderIcon = (icon: LucideIcon | ReactNode) => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function') {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className={`relative ${getWidthClass()}`} ref={dropdownRef}>
      {/* トリガーボタン */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          ${getWidthClass()} ${sizeClasses[size]}
          flex items-center justify-between gap-2 text-stone-900 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {selectedOption?.icon && (
            <span className="text-stone-500">
              {renderIcon(selectedOption.icon)}
            </span>
          )}
          <span
            className={selectedOption ? 'text-stone-900' : 'text-stone-500'}
          >
            {selectedOption?.label ||
              (React.isValidElement(placeholder) ? placeholder : placeholder)}
          </span>
        </div>
        {showChevron && (
          <ChevronDown
            className={`w-4 h-4 text-stone-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className={`
            absolute top-full ${positionClass} mt-1 z-50
            min-w-[160px] bg-white border border-stone-200 rounded-lg shadow-lg
            ${dropdownSizeClasses[size]} ${dropdownClassName}
          `}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              disabled={option.disabled}
              className={`
                w-full flex items-center justify-between gap-2
                ${sizeClasses[size]} text-left
                text-stone-700 transition-colors
                ${
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-stone-50'
                }
                ${option.value === value ? 'bg-stone-50' : ''}
                first:rounded-t-lg last:rounded-b-lg
              `}
            >
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="text-stone-500">
                    {renderIcon(option.icon)}
                  </span>
                )}
                <span>{option.label}</span>
              </div>
              {showSelectedIcon && option.value === value && (
                <Check className="w-4 h-4 text-stone-700" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
