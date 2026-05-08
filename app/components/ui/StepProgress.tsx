'use client';

import { cn } from '@/lib/cn';

interface StepProgressProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function StepProgress({ current, total, label, className }: StepProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between text-xs font-semibold text-cp-braun mb-1.5">
        <span>{label ?? 'Schritt'} {current} von {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-cp-beige/40">
        <div
          className="h-full rounded-full bg-cp-tuerkis transition-all duration-500 ease-smooth"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
