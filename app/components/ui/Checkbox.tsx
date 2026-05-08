'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  hint?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const cbId = id ?? autoId;

  return (
    <div className="w-full">
      <label htmlFor={cbId} className="flex items-start gap-3 cursor-pointer select-none group">
        <span className="relative mt-0.5 inline-block">
          <input ref={ref} id={cbId} type="checkbox" className={cn('peer sr-only', className)} {...rest} />
          <span
            className={cn(
              'block h-5 w-5 rounded-md border-2 transition-all',
              'border-cp-beige bg-white',
              'peer-checked:border-cp-tuerkis peer-checked:bg-cp-tuerkis',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-cp-tuerkis peer-focus-visible:ring-offset-2',
              error && 'border-red-500',
            )}
          />
          <Check className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
        </span>
        {label && <span className="text-sm text-cp-blau leading-snug">{label}</span>}
      </label>
      {(hint || error) && (
        <p className={cn('mt-1 ml-8 text-xs', error ? 'text-red-600' : 'text-cp-braun')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
