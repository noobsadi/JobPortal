import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — JobPortal',
  description: 'Manage your job applications, profile, and job postings.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
