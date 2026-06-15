import { createClient } from '@/lib/supabase/client';
import { Job, JobStatus } from '@/types/database.types';

export async function getOpenJobs(filters?: {
  search?: string;
  jobType?: string;
  location?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  let query = supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*),
      job_skills(
        *,
        skill:skills(*)
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters?.jobType) {
    query = query.eq('job_type', filters.jobType);
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters?.limit || 10)) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getJobById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*),
      job_skills(
        *,
        skill:skills(*)
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getEmployerJobs(companyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*),
      job_skills(*, skill:skills(*))
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createJob(job: Partial<Job> & { company_id: string; title: string; description: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...job, posted_by_user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(id: string, updates: Partial<Job>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJobStatus(id: string, status: JobStatus) {
  return updateJob(id, { status });
}

export async function addJobSkills(jobId: string, skillIds: string[], requiredIds: string[]) {
  const supabase = createClient();
  const records = skillIds.map(skill_id => ({
    job_id: jobId,
    skill_id,
    is_required: requiredIds.includes(skill_id),
  }));
  const { error } = await supabase.from('job_skills').upsert(records);
  if (error) throw error;
}

export async function removeJobSkill(jobId: string, skillId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('job_skills')
    .delete()
    .eq('job_id', jobId)
    .eq('skill_id', skillId);
  if (error) throw error;
}

export async function getAllSkills() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name');
  if (error) throw error;
  return data;
}
