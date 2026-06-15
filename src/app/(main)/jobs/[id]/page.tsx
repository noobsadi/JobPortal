'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getJobById } from '@/lib/queries/jobs';
import { computeMatchScore } from '@/lib/queries/match';
import { hasApplied } from '@/lib/queries/applications';
import { CompanyLogo } from '@/components/ui/Avatar';
import { Badge, SkillBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchScoreRing } from '@/components/match/MatchScoreRing';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  MapPin, Clock, DollarSign, Globe, Briefcase,
  CheckCircle, XCircle, ExternalLink, ArrowLeft
} from 'lucide-react';
import {
  formatSalary, formatRelativeDate, getJobTypeBadge,
  getMatchScoreLabel, getMatchScoreColor
} from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [applied, setApplied] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const [jobData] = await Promise.all([getJobById(id)]);
      setJob(jobData);

      if (user) {
        const { data: u } = await supabase.from('users').select('role').eq('id', user.id).single();
        setDbUser(u);

        const { data: sp } = await supabase.from('seeker_profiles').select('user_id').eq('user_id', user.id).single();
        if (sp) {
          const [matchData, appliedData] = await Promise.all([
            computeMatchScore(user.id, id),
            hasApplied(id, user.id),
          ]);
          setMatch(matchData);
          setApplied(appliedData);
        }
      }
      setLoading(false);
    };
    init();
  }, [id]);

  if (loading) {
    return (
      <div className="container-app py-10 max-w-5xl">
        <Skeleton className="h-6 w-32 mb-6 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Job not found</h1>
        <Link href="/"><Button variant="secondary">Back to Jobs</Button></Link>
      </div>
    );
  }

  const requiredSkills = job.job_skills?.filter((s: any) => s.is_required) || [];
  const optionalSkills = job.job_skills?.filter((s: any) => !s.is_required) || [];
  const isSeeker = dbUser?.role === 'seeker' || !currentUser;

  return (
    <div className="py-10">
      <div className="container-app max-w-5xl">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header card */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-4 mb-5">
                <CompanyLogo src={job.company?.logo_url} name={job.company?.name || ''} size={64} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] leading-tight">{job.title}</h1>
                  <Link href={`/company/${job.company_id}`} className="text-[var(--accent-bright)] hover:underline font-medium mt-1 block">
                    {job.company?.name}
                  </Link>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-[var(--text-muted)]">
                    {job.location && <span className="flex items-center gap-1.5"><MapPin size={13} />{job.location}</span>}
                    <span className="flex items-center gap-1.5"><Briefcase size={13} />{getJobTypeBadge(job.job_type)}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} />{formatRelativeDate(job.created_at)}</span>
                    {(job.salary_min || job.salary_max) && (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <DollarSign size={13} />{formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{getJobTypeBadge(job.job_type)}</Badge>
                {job.company?.industry && <Badge variant="neutral">{job.company.industry}</Badge>}
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Job Description</h2>
              <div
                className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-3 whitespace-pre-wrap"
                style={{ wordBreak: 'break-word' }}
              >
                {job.description}
              </div>
            </div>

            {/* Skills */}
            {(requiredSkills.length > 0 || optionalSkills.length > 0) && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Skills & Requirements</h2>
                {requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.map((js: any) => {
                        const name = js.skill?.name || '';
                        const isMatched = match?.matchedRequired?.includes(name);
                        const isMissing = match?.missingRequired?.includes(name);
                        return (
                          <div key={js.skill_id} className="flex items-center gap-1.5">
                            {isMatched && <CheckCircle size={12} className="text-emerald-400" />}
                            {isMissing && currentUser && <XCircle size={12} className="text-red-400" />}
                            <SkillBadge name={name} matched={isMatched} missing={isMissing && !!currentUser} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {optionalSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Nice to Have</p>
                    <div className="flex flex-wrap gap-2">
                      {optionalSkills.map((js: any) => (
                        <SkillBadge key={js.skill_id} name={js.skill?.name || ''} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Match score card */}
            {currentUser && match && (
              <div className="glass-card p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Your Match Score</p>
                <div className="flex justify-center mb-3">
                  <MatchScoreRing score={match.score} size={100} strokeWidth={7} />
                </div>
                <p className={`font-semibold ${getMatchScoreColor(match.score)}`}>
                  {getMatchScoreLabel(match.score)}
                </p>
                <div className="mt-4 space-y-2 text-left">
                  {match.matchedRequired.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Matched skills</span>
                      <span className="text-emerald-400 font-semibold">{match.matchedRequired.length}</span>
                    </div>
                  )}
                  {match.missingRequired.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Missing skills</span>
                      <span className="text-red-400 font-semibold">{match.missingRequired.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Apply card */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Apply for this role</h3>
              {!currentUser ? (
                <>
                  <p className="text-sm text-[var(--text-muted)]">Sign in to apply and see your skill match score.</p>
                  <Link href={`/login?redirectTo=/jobs/${id}`}>
                    <Button className="w-full">Sign In to Apply</Button>
                  </Link>
                </>
              ) : applied ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle size={16} />
                  <span>You've already applied!</span>
                </div>
              ) : isSeeker ? (
                <Button className="w-full" onClick={() => setApplyOpen(true)}>
                  Apply Now
                </Button>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Employers cannot apply to jobs.</p>
              )}

              {/* Company info */}
              {job.company?.website_url && (
                <a
                  href={job.company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-bright)] transition-colors"
                >
                  <Globe size={13} /> Company website <ExternalLink size={11} />
                </a>
              )}
              {job.company?.founded_year && (
                <p className="text-xs text-[var(--text-muted)]">Founded {job.company.founded_year}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        job={job}
        seekerId={currentUser?.id || ''}
        onApplied={() => { setApplied(true); setApplyOpen(false); }}
      />
    </div>
  );
}
