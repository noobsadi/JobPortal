import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CompanyLogo } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { JobCard } from '@/components/jobs/JobCard';
import { Globe, Calendar, Building2, Briefcase } from 'lucide-react';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('companies').select('name').eq('id', id).single();
  return { title: data?.name ? `${data.name} — JobPortal` : 'Company' };
}

export default async function CompanyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase.from('companies').select('*').eq('id', id).single();
  if (!company) notFound();

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, job_skills(*, skill:skills(*))')
    .eq('company_id', id)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  return (
    <div className="py-10">
      <div className="container-app max-w-4xl">
        {/* Company header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <CompanyLogo src={company.logo_url} name={company.name} size={80} />
            <div className="flex-1">
              <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">{company.name}</h1>
              {company.industry && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant="primary">{company.industry}</Badge>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--text-muted)]">
                {company.founded_year && (
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> Founded {company.founded_year}</span>
                )}
                {company.website_url && (
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[var(--accent-bright)] transition-colors">
                    <Globe size={13} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
          {company.description && (
            <p className="text-[var(--text-secondary)] leading-relaxed">{company.description}</p>
          )}
        </div>

        {/* Open jobs */}
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-5 flex items-center gap-2">
            <Briefcase size={18} /> Open Positions ({jobs?.length || 0})
          </h2>
          {!jobs || jobs.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Building2 size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">No open positions at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={{ ...job, company }} isLoggedIn={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
