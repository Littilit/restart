'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { cn } from '@/lib/cn';

interface ConsentBoxProps {
  label: ReactNode;
  detail: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  error?: string;
  required?: boolean;
}

export function ConsentBox({ label, detail, checked, onChange, error, required }: ConsentBoxProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={cn('rounded-2xl border p-4', error ? 'border-red-500 bg-red-50' : 'border-cp-beige/60 bg-white')}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          label={
            <span>
              {label}
              {required && <span className="text-red-600"> *</span>}
            </span>
          }
        />
      </div>
      <button
        type="button"
        className="mt-2 ml-8 inline-flex items-center gap-1 text-xs font-semibold text-cp-tuerkis hover:text-cp-tuerkis-dark"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        Details {expanded ? 'ausblenden' : 'einblenden'}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && <div className="mt-2 ml-8 text-xs text-cp-braun leading-relaxed">{detail}</div>}
      {error && <p className="mt-2 ml-8 text-xs text-red-600">{error}</p>}
    </div>
  );
}
