'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  hoverable?: boolean;
  accent?: boolean;
}

const paddingStyles: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = 'md', hoverable, accent, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl bg-white border transition-shadow duration-200 ease-smooth',
        accent ? 'border-cp-tuerkis/40' : 'border-cp-beige/50',
        hoverable && 'hover:shadow-lift cursor-pointer',
        'shadow-soft',
        paddingStyles[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
