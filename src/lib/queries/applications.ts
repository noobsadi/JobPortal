import { createClient } from '@/lib/supabase/client';
import { ApplicationStatus } from '@/types/database.types';

export async function applyToJob(jobId: string, seekerId: string, coverLetter?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id: jobId, seeker_id: seekerId, cover_letter: coverLetter })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSeekerApplications(seekerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(
        *,
        company:companies(*)
      ),
      interviews(*)
    `)
    .eq('seeker_id', seekerId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function hasApplied(jobId: string, seekerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('seeker_id', seekerId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function getCompanyApplications(companyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs!inner(
        *,
        company:companies(*)
      ),
      seeker_profile:seeker_profiles(
        *,
        seeker_skills(*, skill:skills(*))
      ),
      interviews(*)
    `)
    .eq('job.company_id', companyId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getJobApplications(jobId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      seeker_profile:seeker_profiles(
        *,
        seeker_skills(*, skill:skills(*)),
        seeker_experience(*),
        seeker_education(*)
      ),
      interviews(*)
    `)
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function scheduleInterview(params: {
  application_id: string;
  interviewer_id: string;
  scheduled_at: string;
  interview_type: 'technical' | 'cultural' | 'hr' | 'final';
  notes?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('interviews')
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInterviewFeedback(id: string, feedback_score: number, notes: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('interviews')
    .update({ feedback_score, notes })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSeekerInterviews(seekerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications!inner(
        *,
        job:jobs(*, company:companies(*))
      )
    `)
    .eq('application.seeker_id', seekerId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data;
}
