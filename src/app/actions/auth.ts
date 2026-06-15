'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function setupSeekerProfile(userId: string, firstName: string, lastName: string) {
  const { error } = await supabaseAdmin.from('seeker_profiles').upsert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
  });
  if (error) throw new Error(error.message);
}

export async function setupEmployerProfile(userId: string, companyName: string, industry?: string, description?: string, title?: string) {
  const { data: company, error: companyError } = await supabaseAdmin.from('companies').insert({
    name: companyName,
    industry,
    description,
  }).select().single();
  
  if (companyError) throw new Error(companyError.message);

  const { error: profileError } = await supabaseAdmin.from('employer_profiles').upsert({
    user_id: userId,
    company_id: company.id,
    title_at_company: title,
    is_company_admin: true,
  });
  
  if (profileError) throw new Error(profileError.message);
}
