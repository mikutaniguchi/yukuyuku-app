'use client';

import React, { forwardRef } from 'react';

interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'date' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  min?: string;
  max?: string;
  step?: string;
}

const FormInput = React.memo(
  forwardRef<HTMLInputElement, FormInputProps>(
    (
      {
        type = 'text',
        placeholder,
        value,
        onChange,
        className = '',
        autoFocus,
        required,
        disabled,
        id,
        name,
        min,
        max,
        step,
        ...props
      },
      ref
    ) => {
      const baseClasses =
        'w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-colors';
      const disabledClasses = disabled ? 'bg-stone-100 cursor-not-allowed' : '';
      const combinedClasses =
        `${baseClasses} ${disabledClasses} ${className}`.trim();

      return (
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={combinedClasses}
          autoFocus={autoFocus}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          {...props}
        />
      );
    }
  )
);

FormInput.displayName = 'FormInput';

export default FormInput;
