'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { applyToJob } from '@/lib/queries/applications';
import { CheckCircle2, FileText } from 'lucide-react';

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: any;
  seekerId: string;
  onApplied: () => void;
}

export function ApplyModal({ open, onClose, job, seekerId, onApplied }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setLoading(true);
    setError('');
    try {
      await applyToJob(job.id, seekerId, coverLetter || undefined);
      onApplied();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Apply — ${job?.title}`} size="md">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border-accent)]">
          <FileText size={18} className="text-[var(--accent-bright)] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{job?.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{job?.company?.name} · {job?.location || 'Remote'}</p>
          </div>
        </div>

        <Textarea
          label="Cover Letter (optional)"
          placeholder={`Hi ${job?.company?.name} team,\n\nI'm excited to apply for the ${job?.title} role because...`}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={7}
          hint="A personalised message increases your chances significantly."
        />

        {error && (
          <p className="text-sm text-red-400 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            loading={loading}
            icon={<CheckCircle2 size={16} />}
          >
            Submit Application
          </Button>
        </div>
      </div>
    </Modal>
  );
}
