'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({
  message,
  className = '',
}: ErrorMessageProps) {
  if (!message) return null;

  const baseClasses =
    'p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return <div className={combinedClasses}>{message}</div>;
}
