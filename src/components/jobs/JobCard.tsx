'use client';

import Link from 'next/link';
import { Job } from '@/types/database.types';
import { CompanyLogo } from '@/components/ui/Avatar';
import { Badge, SkillBadge } from '@/components/ui/Badge';
import { MatchScoreRing } from '@/components/match/MatchScoreRing';
import { MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { formatSalary, formatRelativeDate, getJobTypeBadge, cn } from '@/lib/utils';

interface JobCardProps {
  job: Job & { company?: any; job_skills?: any[] };
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  isLoggedIn?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function JobCard({ job, matchScore, matchedSkills = [], missingSkills = [], isLoggedIn, onClick, isSelected }: JobCardProps) {
  const requiredSkills = job.job_skills?.filter((s: any) => s.is_required).slice(0, 4) || [];
  const hasMatch = matchScore !== undefined;

  const CardWrapper = onClick ? 'button' : 'div';
  const titleContent = (
    <span className="text-[18px] font-bold text-[var(--text-primary)] hover:text-[var(--accent-bright)] transition-colors line-clamp-1 leading-snug block mb-[6px] text-left">
      {job.title}
    </span>
  );

  return (
    <CardWrapper 
      onClick={onClick}
      className={cn(
        "relative glass-card p-6 rounded-2xl flex flex-col h-full group text-left transition-all duration-200 w-full",
        onClick ? "cursor-pointer hover:border-[var(--accent)] hover:shadow-md" : "",
        isSelected ? "border-[var(--accent)] ring-1 ring-[var(--accent)] shadow-md bg-[var(--bg-base)] scale-[1.02]" : ""
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <CompanyLogo
          src={job.company?.logo_url}
          name={job.company?.name || 'Company'}
          size={52}
        />

        <div className="flex-1 min-w-0">
          {!onClick ? (
            <Link href={`/jobs/${job.id}`}>
              {titleContent}
            </Link>
          ) : (
            titleContent
          )}
          
          <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
            {job.company?.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
            {job.location && (
              <span className="flex items-center gap-[6px]">
                <MapPin size={11} /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-[6px]">
              <Clock size={11} /> {formatRelativeDate(job.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Match score ring - absolute top-right with 16px margin */}
      {isLoggedIn && hasMatch && (
        <div className="absolute top-4 right-4 hidden sm:block">
          <MatchScoreRing score={matchScore!} size={56} strokeWidth={4} />
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="primary" className="h-[28px] px-[10px] inline-flex items-center justify-center leading-none">{getJobTypeBadge(job.job_type)}</Badge>
        {job.salary_min || job.salary_max ? (
          <Badge variant="neutral" className="h-[28px] px-[10px] inline-flex items-center justify-center leading-none">
            <DollarSign size={10} className="mr-0.5" />
            {formatSalary(job.salary_min, job.salary_max)}
          </Badge>
        ) : null}
        {job.company?.industry && (
          <Badge variant="neutral" className="h-[28px] px-[10px] inline-flex items-center justify-center leading-none">{job.company.industry}</Badge>
        )}
      </div>

      {/* Skills preview */}
      {requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-[10px]">
          {requiredSkills.map((js: any) => {
            const name = js.skill?.name || '';
            const isMatched = matchedSkills.includes(name);
            const isMissing = missingSkills.includes(name);
            return (
              <SkillBadge
                key={js.skill_id}
                name={name}
                matched={isMatched}
                missing={isMissing && isLoggedIn}
                className="py-[8px] px-[14px] text-[13px] inline-flex items-center justify-center leading-none"
              />
            );
          })}
          {(job.job_skills?.filter((s: any) => s.is_required).length || 0) > 4 && (
            <span className="badge badge-neutral py-[8px] px-[14px] text-[13px] inline-flex items-center justify-center leading-none">
              +{(job.job_skills?.filter((s: any) => s.is_required).length || 0) - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-4">
        {isLoggedIn && hasMatch ? (
          <span className={cn('text-xs font-medium', matchScore! >= 80 ? 'match-excellent' : matchScore! >= 60 ? 'match-good' : matchScore! >= 40 ? 'match-fair' : 'match-low')}>
            {matchScore}% skills match
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">{job.company?.industry || 'General'}</span>
        )}
        
        {!onClick && (
          <Link
            href={`/jobs/${job.id}`}
            className="btn btn-secondary btn-sm shrink-0 flex items-center justify-center h-10 px-5"
          >
            View Job <ChevronRight size={13} className="ml-1" />
          </Link>
        )}
      </div>
    </CardWrapper>
  );
}
