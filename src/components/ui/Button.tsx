'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props }, ref) => {
    const classes = cn(
      'btn',
      variant === 'primary'   && 'btn-primary',
      variant === 'secondary' && 'btn-secondary',
      variant === 'ghost'     && 'btn-ghost',
      variant === 'danger'    && 'btn-danger',
      size === 'sm'           && 'btn-sm',
      size === 'lg'           && 'btn-lg',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity={0.25} />
      <path d="M21 12a9 9 0 00-9-9" />
    </svg>
  );
}

export { Button, Spinner };
