'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link, { type LinkProps } from 'next/link';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'outline-light';
type Size = 'sm' | 'md' | 'lg';

interface BaseVisualProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseVisualProps {
  loading?: boolean;
}

type ButtonLinkProps = Omit<LinkProps, 'className'> &
  BaseVisualProps & { className?: string; children?: ReactNode };

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-cp-blau text-white hover:bg-cp-schwarzblau active:scale-[0.98] shadow-soft disabled:bg-cp-blau/50',
  secondary:
    'bg-cp-tuerkis text-white hover:bg-cp-tuerkis-dark active:scale-[0.98] shadow-soft disabled:bg-cp-tuerkis/50',
  outline:
    'bg-transparent text-cp-blau border border-cp-blau hover:bg-cp-blau hover:text-white active:scale-[0.98]',
  'outline-light':
    'bg-transparent text-white border border-white/40 hover:bg-white/10 active:scale-[0.98]',
  ghost: 'bg-transparent text-cp-blau hover:bg-cp-beige/30 active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-7 text-lg',
};

function baseClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
}: Required<Pick<BaseVisualProps, 'variant' | 'size'>> & { fullWidth?: boolean }) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
    'transition-all duration-150 ease-smooth',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-tuerkis focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed no-underline',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, leftIcon, rightIcon, fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseClasses({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
});

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={cn(baseClasses({ variant, size, fullWidth }), className)}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  );
}
