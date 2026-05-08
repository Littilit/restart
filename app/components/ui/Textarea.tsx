'use client';

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, rows = 4, ...rest },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-semibold text-cp-blau">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-xl border bg-white p-3 text-cp-blau placeholder:text-cp-braun/60',
          'transition-colors focus:outline-none',
          error ? 'border-red-500 focus:border-red-600' : 'border-cp-beige/70 focus:border-cp-tuerkis',
          className,
        )}
        {...rest}
      />
      {(hint || error) && (
        <p className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-cp-braun')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
