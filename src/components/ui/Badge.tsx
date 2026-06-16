'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'neutral', className, dot }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-75"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

interface SkillBadgeProps {
  name: string;
  matched?: boolean;
  missing?: boolean;
  onClick?: () => void;
  removable?: boolean;
  className?: string;
}

export function SkillBadge({ name, matched, missing, onClick, removable, className }: SkillBadgeProps) {
  const variant = matched ? 'success' : missing ? 'danger' : 'primary';
  return (
    <span
      className={cn('badge', `badge-${variant}`, onClick && 'cursor-pointer hover:opacity-80 transition-opacity', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {name}
      {removable && (
        <span className="ml-1 opacity-60 hover:opacity-100">×</span>
      )}
    </span>
  );
}
