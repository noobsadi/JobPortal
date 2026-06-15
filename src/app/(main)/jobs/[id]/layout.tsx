import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('jobs').select('title, company:companies(name)').eq('id', id).single();
  
  const companyName = (data?.company as any)?.name || 'Company';
  const title = data?.title ? `${data.title} at ${companyName}` : 'Job Details';

  return {
    title: `${title} — JobPortal`,
    description: `View job details and apply for ${title} on JobPortal.`,
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
