import { createClient } from '@/lib/supabase/server';
import { Company } from '@/types/database.types';
import Link from 'next/link';
import { Building2, MapPin, Globe, Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Companies | JobPortal',
  description: 'Discover top companies hiring on JobPortal.',
};

export default async function CompaniesPage() {
  const supabase = await createClient();

  // Fetch companies and count their open jobs
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*, jobs(id, status)');

  const formattedCompanies = companies?.map(company => {
    const openJobsCount = company.jobs?.filter((job: any) => job.status === 'open').length || 0;
    return {
      ...company,
      openJobsCount
    };
  }) || [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-gradient-to-br from-[#A5E9DD]/20 to-[#6FBEB2]/5 blur-3xl" />
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#FDF4AF]/20 to-[#34908B]/5 blur-3xl" />
        </div>

        <div className="container-app relative z-10 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', color: 'var(--accent-bright)' }}>
              <Building2 size={14} fill="currentColor" />
              Top Employers
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-6 tracking-tight">
              Discover Great<br />
              <span className="gradient-text">Workplaces</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Find your next career opportunity at one of our featured companies.
            </p>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-16">
        <div className="container-app">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-8">
              Failed to load companies: {error.message}
            </div>
          )}

          {!formattedCompanies.length && !error ? (
            <div className="text-center py-20 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
              <Building2 size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Companies Found</h3>
              <p className="text-[var(--text-secondary)]">We couldn't find any registered companies yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedCompanies.map((company, index) => (
                <div key={company.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col h-full">
                    
                    {/* Header: Logo & Name */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 rounded-xl border border-[var(--border)] overflow-hidden shrink-0 bg-white flex items-center justify-center p-1">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={`${company.name} logo`} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 size={24} className="text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {company.name}
                        </h3>
                        {company.industry && (
                          <p className="text-sm text-[var(--text-secondary)]">{company.industry}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-6 flex-1">
                      {company.description || "No description provided."}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <MapPin size={16} className="text-[var(--text-muted)]" />
                        <span>Global</span>
                      </div>
                      {company.website_url && (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Globe size={16} className="text-[var(--text-muted)]" />
                          <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] hover:underline truncate">
                            {company.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Footer action */}
                    <div className="pt-5 border-t border-[var(--border)] mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)] bg-[var(--accent-subtle)] px-3 py-1.5 rounded-lg">
                        <Briefcase size={16} />
                        {company.openJobsCount} Open Jobs
                      </div>
                      <Link 
                        href={`/`}
                        className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                      >
                        View Profile &rarr;
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
