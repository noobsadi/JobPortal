import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizeMap = {
  xs: { px: 24, text: 'text-[10px]' },
  sm: { px: 32, text: 'text-xs' },
  md: { px: 40, text: 'text-sm' },
  lg: { px: 56, text: 'text-base' },
  xl: { px: 80, text: 'text-xl' },
};

export function Avatar({ src, firstName = '', lastName = '', name, size = 'md', className, ring }: AvatarProps) {
  const { px, text } = sizeMap[size];
  const initials = name
    ? name.charAt(0).toUpperCase()
    : getInitials(firstName, lastName);

  const inner = (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center shrink-0',
        'bg-gradient-to-br from-violet-600 to-indigo-600',
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          src={src}
          alt={name || `${firstName} ${lastName}`}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <span className={cn('font-semibold text-white', text)}>{initials}</span>
      )}
    </div>
  );

  if (ring) {
    return (
      <div
        className="rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-indigo-500 shrink-0"
        style={{ width: px + 4, height: px + 4 }}
      >
        {inner}
      </div>
    );
  }

  return inner;
}

interface CompanyLogoProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ src, name, size = 48, className }: CompanyLogoProps) {
  if (src) {
    return (
      <div
        className={cn('relative rounded-full overflow-hidden shrink-0 bg-[var(--bg-elevated)]', className)}
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={name} fill unoptimized className="object-contain p-1" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-bold text-white',
        'bg-gradient-to-br from-violet-700 to-indigo-700',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
