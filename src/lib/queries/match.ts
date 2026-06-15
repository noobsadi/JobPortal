import { createClient } from '@/lib/supabase/client';

export interface MatchResult {
  score: number;
  matchedRequired: string[];
  matchedOptional: string[];
  missingRequired: string[];
}

/**
 * Compute match score between a seeker and a job.
 * 
 * Algorithm:
 *   baseScore = (matchedRequired / totalRequired) * 100
 *   bonus     = min(matchedOptional.length * 5, 20)
 *   finalScore = min(baseScore + bonus, 100)
 */
export async function computeMatchScore(
  seekerId: string,
  jobId: string
): Promise<MatchResult> {
  const supabase = createClient();

  const [seekerSkillsRes, jobSkillsRes] = await Promise.all([
    supabase
      .from('seeker_skills')
      .select('skill_id, skill:skills(name)')
      .eq('seeker_id', seekerId),
    supabase
      .from('job_skills')
      .select('skill_id, is_required, skill:skills(name)')
      .eq('job_id', jobId),
  ]);

  if (seekerSkillsRes.error || jobSkillsRes.error) {
    return { score: 0, matchedRequired: [], matchedOptional: [], missingRequired: [] };
  }

  const seekerSkillIds = new Set(seekerSkillsRes.data.map((s) => s.skill_id));
  const requiredJobSkills = jobSkillsRes.data.filter((s) => s.is_required);
  const optionalJobSkills = jobSkillsRes.data.filter((s) => !s.is_required);

  const matchedRequired = requiredJobSkills
    .filter((s) => seekerSkillIds.has(s.skill_id))
    .map((s) => (s.skill as any)?.name ?? '');

  const missingRequired = requiredJobSkills
    .filter((s) => !seekerSkillIds.has(s.skill_id))
    .map((s) => (s.skill as any)?.name ?? '');

  const matchedOptional = optionalJobSkills
    .filter((s) => seekerSkillIds.has(s.skill_id))
    .map((s) => (s.skill as any)?.name ?? '');

  const totalRequired = requiredJobSkills.length;
  const baseScore = totalRequired > 0
    ? (matchedRequired.length / totalRequired) * 100
    : 100; // No required skills = perfect match

  const bonus = Math.min(matchedOptional.length * 5, 20);
  const score = Math.min(Math.round(baseScore + bonus), 100);

  return { score, matchedRequired, matchedOptional, missingRequired };
}

/**
 * Batch compute match scores for a list of jobs.
 * Returns a map of jobId -> MatchResult
 */
export async function batchComputeMatchScores(
  seekerId: string,
  jobIds: string[]
): Promise<Record<string, MatchResult>> {
  const results = await Promise.all(
    jobIds.map(async (jobId) => ({
      jobId,
      result: await computeMatchScore(seekerId, jobId),
    }))
  );
  return Object.fromEntries(results.map((r) => [r.jobId, r.result]));
}
