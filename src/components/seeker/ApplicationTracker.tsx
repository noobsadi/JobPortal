'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { CompanyLogo } from '@/components/ui/Avatar';
import { formatRelativeDate, getStatusColor, getStatusLabel, formatFullDate } from '@/lib/utils';
import { Briefcase, Calendar, Clock, ChevronRight, Inbox } from 'lucide-react';

interface ApplicationTrackerProps {
  applications: any[];
}

const STATUS_ORDER = ['pending', 'reviewing', 'interviewing', 'offered', 'rejected'];

export function ApplicationTracker({ applications }: ApplicationTrackerProps) {
  if (applications.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Inbox size={36} className="mx-auto mb-3 text-[var(--text-muted)]" />
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">No applications yet</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Start applying to jobs that match your skills.</p>
        <Link href="/" className="btn btn-secondary btn-sm">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="font-semibold text-[var(--text-primary)]">My Applications</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{applications.length} total</p>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {applications.map((app) => (
          <li key={app.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <CompanyLogo
              src={app.job?.company?.logo_url}
              name={app.job?.company?.name || '?'}
              size={42}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/jobs/${app.job_id}`}
                    className="font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--accent-bright)] transition-colors line-clamp-1"
                  >
                    {app.job?.title}
                  </Link>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{app.job?.company?.name}</p>
                </div>
                <span className={`badge shrink-0 ${getStatusColor(app.status)}`}>
                  {getStatusLabel(app.status)}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock size={10} /> Applied {formatRelativeDate(app.applied_at)}
                </span>
                {app.interviews?.length > 0 && (
                  <span className="flex items-center gap-1 text-violet-400">
                    <Calendar size={10} />
                    Interview: {formatFullDate(app.interviews[0].scheduled_at)}
                  </span>
                )}
              </div>

              {/* Status pipeline */}
              <div className="flex items-center gap-0.5 mt-3">
                {STATUS_ORDER.filter(s => s !== 'rejected').map((s, i) => {
                  const currentIdx = STATUS_ORDER.indexOf(app.status);
                  const stepIdx = STATUS_ORDER.indexOf(s);
                  const isActive = currentIdx >= stepIdx;
                  const isRejected = app.status === 'rejected';
                  return (
                    <div key={s} className="flex items-center gap-0.5 flex-1">
                      <div
                        className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                          isRejected ? 'bg-[var(--bg-elevated)]' :
                          isActive ? 'bg-gradient-to-r from-violet-600 to-indigo-500' : 'bg-[var(--bg-elevated)]'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
