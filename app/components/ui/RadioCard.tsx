'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  emoji?: string;
  disabled?: boolean;
}

export function RadioCard({ name, value, checked, onChange, title, description, icon, emoji, disabled }: RadioCardProps) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 md:p-5',
        'transition-all duration-150 ease-smooth select-none',
        checked ? 'border-cp-tuerkis bg-cp-tuerkis/5 shadow-soft' : 'border-cp-beige/60 bg-white hover:border-cp-beige',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="sr-only"
      />
      {emoji && <span aria-hidden className="text-2xl md:text-3xl leading-none shrink-0">{emoji}</span>}
      {icon && !emoji && <span className="text-cp-tuerkis shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-cp-blau">{title}</div>
        {description && <div className="mt-0.5 text-sm text-cp-braun leading-snug">{description}</div>}
      </div>
      <span className={cn('mt-1 h-5 w-5 shrink-0 rounded-full border-2 transition-all', checked ? 'border-cp-tuerkis' : 'border-cp-beige')}>
        {checked && <span className="block h-full w-full rounded-full bg-cp-tuerkis scale-50" />}
      </span>
    </label>
  );
}
