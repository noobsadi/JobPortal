export type UserRole = 'seeker' | 'employer' | 'admin';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'expert';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
export type JobStatus = 'open' | 'closed' | 'draft';
export type ApplicationStatus = 'pending' | 'reviewing' | 'interviewing' | 'offered' | 'rejected';
export type InterviewType = 'technical' | 'cultural' | 'hr' | 'final';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login: string | null;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  founded_year: number | null;
  created_at: string;
}

export interface EmployerProfile {
  user_id: string;
  company_id: string | null;
  title_at_company: string | null;
  is_company_admin: boolean;
  created_at: string;
  company?: Company;
}

export interface SeekerProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  resume_url: string | null;
  github_url: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeekerExperience {
  id: string;
  seeker_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current_role: boolean;
  description: string | null;
  created_at: string;
}

export interface SeekerEducation {
  id: string;
  seeker_id: string;
  institution_name: string;
  degree: string;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface SeekerSkill {
  seeker_id: string;
  skill_id: string;
  years_of_experience: number | null;
  proficiency: ProficiencyLevel;
  skill?: Skill;
}

export interface JobSkill {
  job_id: string;
  skill_id: string;
  is_required: boolean;
  skill?: Skill;
}

export interface Job {
  id: string;
  company_id: string;
  posted_by_user_id: string;
  title: string;
  description: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  job_type: JobType;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  company?: Company;
  job_skills?: JobSkill[];
}

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  applied_at: string;
  job?: Job;
  seeker_profile?: SeekerProfile;
}

export interface Interview {
  id: string;
  application_id: string;
  interviewer_id: string | null;
  scheduled_at: string;
  interview_type: InterviewType;
  notes: string | null;
  feedback_score: number | null;
  created_at: string;
  application?: Application;
}

export interface JobWithMatch extends Job {
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export interface ApplicationWithDetails extends Application {
  job: Job & { company: Company };
  interviews?: Interview[];
}
