'use client';

import { cn } from '@/lib/cn';

interface ChipOption {
  value: string;
  label: string;
  emoji?: string;
}

interface ChipSelectProps {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  ariaLabel?: string;
}

export function ChipSelect({ options, value, onChange, multi = true, ariaLabel }: ChipSelectProps) {
  function toggle(val: string) {
    if (multi) {
      onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
    } else {
      onChange(value[0] === val ? [] : [val]);
    }
  }

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            aria-pressed={selected}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium',
              'transition-all duration-150 ease-smooth active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-tuerkis focus-visible:ring-offset-2',
              selected
                ? 'bg-cp-blau text-white border-cp-blau'
                : 'bg-white text-cp-blau border-cp-beige/70 hover:border-cp-blau',
            )}
          >
            {opt.emoji && <span aria-hidden>{opt.emoji}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
