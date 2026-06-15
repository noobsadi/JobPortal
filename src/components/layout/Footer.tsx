import Link from 'next/link';
import { Zap, Code2, MessageSquare, Link2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-base text-[var(--text-primary)]">
                Job<span className="gradient-text">Portal</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Connecting great talent with great companies. Built for the modern workforce.
            </p>
            <div className="flex gap-3 mt-4">
              {[Code2, MessageSquare, Link2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'For Job Seekers',
              links: [
                { href: '/', label: 'Browse Jobs' },
                { href: '/signup', label: 'Create Profile' },
                { href: '/dashboard/seeker', label: 'My Applications' },
              ],
            },
            {
              title: 'For Employers',
              links: [
                { href: '/signup', label: 'Post a Job' },
                { href: '/dashboard/employer', label: 'Employer Dashboard' },
                { href: '/dashboard/employer/pipeline', label: 'Hiring Pipeline' },
              ],
            },
            {
              title: 'Company',
              links: [
                { href: '#', label: 'About Us' },
                { href: '#', label: 'Privacy Policy' },
                { href: '#', label: 'Terms of Service' },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Built with Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
