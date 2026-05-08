'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightAddon, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-cp-blau">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-white px-3.5 transition-colors',
          error
            ? 'border-red-500 focus-within:border-red-600'
            : 'border-cp-beige/70 focus-within:border-cp-tuerkis',
        )}
      >
        {leftIcon && <span className="text-cp-braun">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex-1 h-11 bg-transparent text-cp-blau placeholder:text-cp-braun/60 focus:outline-none',
            className,
          )}
          {...rest}
        />
        {rightAddon && <span className="text-sm text-cp-braun">{rightAddon}</span>}
      </div>
      {(hint || error) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-cp-braun')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
