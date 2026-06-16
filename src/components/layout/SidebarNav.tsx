'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Users, 
  PlusSquare,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const seekerLinks = [
  { href: '/dashboard/seeker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/seeker/profile', label: 'My Profile', icon: User },
  { href: '/', label: 'Browse Jobs', icon: Search },
];

const employerLinks = [
  { href: '/dashboard/employer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/employer/jobs', label: 'Job Postings', icon: Briefcase },
  { href: '/dashboard/employer/jobs/new', label: 'Post a Job', icon: PlusSquare },
  { href: '/dashboard/employer/pipeline', label: 'Candidates', icon: Users },
  { href: '/', label: 'Browse Jobs', icon: Search },
];

export function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();
  const links = role === 'employer' ? employerLinks : seekerLinks;
  return (
    <>
      {/* Sidebar Container */}
      <aside className={cn(
        "hidden md:flex flex-col sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 z-40 shrink-0",
        "glass-card rounded-none border-t-0 border-b-0 border-l-0 border-r border-[var(--border)]"
      )}>
        <div className="flex flex-col h-full py-8 px-4 overflow-y-auto">
          
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                    isActive 
                      ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
