import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import { JobType, ApplicationStatus, ProficiencyLevel } from '@/types/database.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM yyyy');
}

export function formatFullDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function getJobTypeBadge(type: JobType): string {
  const map: Record<JobType, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    remote: 'Remote',
  };
  return map[type] || type;
}

export function getStatusColor(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    pending: 'badge-warning',
    reviewing: 'badge-info',
    interviewing: 'badge-primary',
    offered: 'badge-success',
    rejected: 'badge-danger',
  };
  return map[status] || 'badge-neutral';
}

export function getStatusLabel(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    pending: 'Pending',
    reviewing: 'Reviewing',
    interviewing: 'Interviewing',
    offered: 'Offered 🎉',
    rejected: 'Not Selected',
  };
  return map[status] || status;
}

export function getProficiencyColor(level: ProficiencyLevel): string {
  const map: Record<ProficiencyLevel, string> = {
    beginner: 'badge-warning',
    intermediate: 'badge-info',
    expert: 'badge-primary',
  };
  return map[level];
}

export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'match-excellent';
  if (score >= 60) return 'match-good';
  if (score >= 40) return 'match-fair';
  return 'match-low';
}

export function getMatchScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'Low Match';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
