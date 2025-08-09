'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import Button from './Button';

interface InlineEditFormProps {
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  displayClassName?: string;
  showEditButton?: boolean;
  required?: boolean;
  maxLength?: number;
}

export default function InlineEditForm({
  value,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  placeholder = '',
  className = '',
  inputClassName = '',
  displayClassName = '',
  showEditButton = true,
  required = true,
  maxLength,
}: InlineEditFormProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset edit value when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditValue(value);
    }
  }, [isEditing, value]);

  // Auto focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle outside click to cancel editing
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current
          .closest('.inline-edit-form')
          ?.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, onCancel]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (required && !trimmedValue) return;
    if (trimmedValue === value) {
      onCancel();
      return;
    }
    onSave(trimmedValue);
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isValid = required ? editValue.trim() !== '' : true;
  const hasChanged = editValue.trim() !== value;
  const canSave = isValid && hasChanged;

  if (!isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          onClick={!showEditButton ? onStartEdit : undefined}
          className={`flex-1 ${displayClassName} ${
            !showEditButton ? 'cursor-pointer hover:bg-stone-50' : ''
          }`}
        >
          {value}
        </div>
        {showEditButton && (
          <Button onClick={onStartEdit} variant="icon" size="sm">
            <Edit2 className="w-4 h-4 text-stone-400 hover:text-stone-600" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-edit-form flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 text-stone-900 bg-white ${inputClassName}`}
      />
      <Button
        onClick={handleSave}
        disabled={!canSave}
        variant="icon"
        size="sm"
        className={`${
          canSave
            ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
            : 'text-stone-400 cursor-not-allowed'
        }`}
      >
        <Check
          className={`w-4 h-4 ${canSave ? 'stroke-[2.5] text-green-600' : 'text-stone-400'}`}
        />
      </Button>
      <Button onClick={handleCancel} variant="icon" size="sm">
        <X className="w-4 h-4 text-stone-500 hover:text-stone-600" />
      </Button>
    </div>
  );
}
