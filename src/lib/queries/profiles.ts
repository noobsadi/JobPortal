import { createClient } from '@/lib/supabase/client';
import {
  SeekerProfile, SeekerExperience, SeekerEducation,
  SeekerSkill, EmployerProfile, Company
} from '@/types/database.types';

// ─── Seeker Profiles ────────────────────────────────────────

export async function getSeekerProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_profiles')
    .select(`
      *,
      seeker_experience(*),
      seeker_education(*),
      seeker_skills(*, skill:skills(*))
    `)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertSeekerProfile(profile: Partial<SeekerProfile> & { user_id: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_profiles')
    .upsert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Experience ─────────────────────────────────────────────

export async function addExperience(exp: Omit<SeekerExperience, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_experience')
    .insert(exp)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExperience(id: string, exp: Partial<SeekerExperience>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_experience')
    .update(exp)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExperience(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('seeker_experience').delete().eq('id', id);
  if (error) throw error;
}

// ─── Education ──────────────────────────────────────────────

export async function addEducation(edu: Omit<SeekerEducation, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_education')
    .insert(edu)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEducation(id: string, edu: Partial<SeekerEducation>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_education')
    .update(edu)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEducation(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('seeker_education').delete().eq('id', id);
  if (error) throw error;
}

// ─── Skills ─────────────────────────────────────────────────

export async function getSeekerSkills(seekerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_skills')
    .select('*, skill:skills(*)')
    .eq('seeker_id', seekerId);
  if (error) throw error;
  return data;
}

export async function addSeekerSkill(skill: Omit<SeekerSkill, 'skill'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seeker_skills')
    .upsert(skill)
    .select('*, skill:skills(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function removeSeekerSkill(seekerId: string, skillId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('seeker_skills')
    .delete()
    .eq('seeker_id', seekerId)
    .eq('skill_id', skillId);
  if (error) throw error;
}

// ─── Employer Profiles ──────────────────────────────────────

export async function getEmployerProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employer_profiles')
    .select('*, company:companies(*)')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertEmployerProfile(profile: Partial<EmployerProfile> & { user_id: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employer_profiles')
    .upsert(profile)
    .select('*, company:companies(*)')
    .single();
  if (error) throw error;
  return data;
}

// ─── Companies ──────────────────────────────────────────────

export async function createCompany(company: Partial<Company> & { name: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCompany(id: string, updates: Partial<Company>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function searchCompanies(query: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10);
  if (error) throw error;
  return data;
}

export async function getCompanyById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ─── Avatar / Resume Upload ──────────────────────────────────

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadResume(userId: string, file: File) {
  const supabase = createClient();
  const path = `${userId}/resume.pdf`;
  const { error } = await supabase.storage
    .from('resumes')
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = await supabase.storage
    .from('resumes')
    .createSignedUrl(path, 3600);
  return data?.signedUrl;
}

export async function uploadCompanyLogo(companyId: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${companyId}/logo.${ext}`;
  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('logos').getPublicUrl(path);
  return data.publicUrl;
}
