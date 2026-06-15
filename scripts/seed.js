const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log("Starting database seed...");

  // 1. Create a dummy employer user
  console.log("Creating dummy employer...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'employer@test.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'employer' }
  });

  if (authError && !authError.message.includes('already')) {
    console.error("Error creating user:", authError.message);
    return;
  }

  let employerId;
  if (authError && authError.message.includes('already')) {
    // Fetch existing user
    const { data: users } = await supabase.auth.admin.listUsers();
    employerId = users.users.find(u => u.email === 'employer@test.com')?.id;
  } else {
    employerId = authData.user.id;
  }
  console.log("Employer ID:", employerId);

  // 2. Create Companies
  console.log("Creating companies...");
  const companiesData = [
    { name: 'TechFlow Solutions', industry: 'Software', description: 'A fast-growing B2B SaaS company.' },
    { name: 'GreenEnergy Corp', industry: 'Renewables', description: 'Building the future of sustainable energy.' },
    { name: 'Nexus Innovations', industry: 'Fintech', description: 'Disrupting traditional banking.' }
  ];

  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .insert(companiesData)
    .select();

  if (companiesError) {
    console.error("Error creating companies:", companiesError.message);
    return;
  }

  // Ensure employer is linked to the first company
  const { error: profileError } = await supabase.from('employer_profiles').upsert({
    user_id: employerId,
    company_id: companies[0].id,
    title_at_company: 'Lead Recruiter',
    is_company_admin: true
  });
  if (profileError) console.error("Error linking profile:", profileError.message);

  // 3. Fetch Skills
  const { data: skills } = await supabase.from('skills').select('*');
  const getSkillId = (name) => skills?.find(s => s.name === name)?.id;

  // 4. Create Jobs
  console.log("Creating jobs...");
  const jobsData = [
    {
      company_id: companies[0].id,
      posted_by_user_id: employerId,
      title: 'Senior Frontend Engineer',
      description: 'We are looking for an experienced Frontend Engineer to lead our React architecture.\n\nRequirements:\n- 5+ years experience\n- Next.js expertise',
      location: 'Remote',
      salary_min: 120000,
      salary_max: 160000,
      job_type: 'full_time',
      status: 'open'
    },
    {
      company_id: companies[1].id,
      posted_by_user_id: employerId,
      title: 'Data Scientist',
      description: 'Join our renewables team to analyze solar grid data using modern ML frameworks.',
      location: 'San Francisco, CA',
      salary_min: 130000,
      salary_max: 155000,
      job_type: 'full_time',
      status: 'open'
    },
    {
      company_id: companies[2].id,
      posted_by_user_id: employerId,
      title: 'UX/UI Designer',
      description: 'Design beautiful fintech products. Must have a strong portfolio demonstrating glassmorphism and modern UI trends.',
      location: 'New York, NY (Hybrid)',
      salary_min: 90000,
      salary_max: 120000,
      job_type: 'contract',
      status: 'open'
    },
    {
      company_id: companies[0].id,
      posted_by_user_id: employerId,
      title: 'Backend Developer (Node.js)',
      description: 'Scale our API infrastructure. We process millions of requests per day.',
      location: 'Remote',
      salary_min: 110000,
      salary_max: 140000,
      job_type: 'full_time',
      status: 'open'
    }
  ];

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .insert(jobsData)
    .select();

  if (jobsError) {
    console.error("Error creating jobs:", jobsError.message);
    return;
  }

  // 5. Assign Skills to Jobs
  console.log("Assigning skills to jobs...");
  const jobSkillsData = [];
  
  if (jobs[0] && getSkillId('React')) {
    jobSkillsData.push({ job_id: jobs[0].id, skill_id: getSkillId('React'), is_required: true });
    jobSkillsData.push({ job_id: jobs[0].id, skill_id: getSkillId('Next.js'), is_required: true });
    jobSkillsData.push({ job_id: jobs[0].id, skill_id: getSkillId('TypeScript'), is_required: true });
  }
  
  if (jobs[1] && getSkillId('Python')) {
    jobSkillsData.push({ job_id: jobs[1].id, skill_id: getSkillId('Python'), is_required: true });
    jobSkillsData.push({ job_id: jobs[1].id, skill_id: getSkillId('SQL'), is_required: true });
    jobSkillsData.push({ job_id: jobs[1].id, skill_id: getSkillId('Machine Learning'), is_required: false });
  }

  if (jobs[2] && getSkillId('Figma')) {
    jobSkillsData.push({ job_id: jobs[2].id, skill_id: getSkillId('Figma'), is_required: true });
    jobSkillsData.push({ job_id: jobs[2].id, skill_id: getSkillId('UI/UX Design'), is_required: true });
  }

  if (jobs[3] && getSkillId('Node.js')) {
    jobSkillsData.push({ job_id: jobs[3].id, skill_id: getSkillId('Node.js'), is_required: true });
    jobSkillsData.push({ job_id: jobs[3].id, skill_id: getSkillId('TypeScript'), is_required: true });
    jobSkillsData.push({ job_id: jobs[3].id, skill_id: getSkillId('PostgreSQL'), is_required: true });
  }

  const { error: jsError } = await supabase.from('job_skills').insert(jobSkillsData);
  if (jsError) console.error("Error assigning skills:", jsError.message);

  // 6. Create a dummy seeker user
  console.log("Creating dummy seeker...");
  const { data: seekerAuthData, error: seekerAuthError } = await supabase.auth.admin.createUser({
    email: 'seeker@test.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'seeker' }
  });

  let seekerId;
  if (seekerAuthError && seekerAuthError.message.includes('already')) {
    const { data: users } = await supabase.auth.admin.listUsers();
    seekerId = users.users.find(u => u.email === 'seeker@test.com')?.id;
  } else if (!seekerAuthError) {
    seekerId = seekerAuthData.user.id;
  } else {
    console.error("Error creating seeker:", seekerAuthError.message);
    return;
  }
  console.log("Seeker ID:", seekerId);

  // 7. Update Seeker Profile
  console.log("Updating seeker profile...");
  await supabase.from('seeker_profiles').upsert({
    user_id: seekerId,
    first_name: 'John',
    last_name: 'Doe',
    headline: 'Senior React Developer',
    bio: 'Passionate about building scalable web applications with modern tech stacks.',
    location: 'Remote'
  });

  // 8. Seeker Experience
  console.log("Creating seeker experience...");
  await supabase.from('seeker_experience').insert([
    {
      seeker_id: seekerId,
      company_name: 'Tech Corp',
      job_title: 'Frontend Developer',
      start_date: '2020-01-01',
      end_date: '2023-01-01',
      is_current_role: false,
      description: 'Developed and maintained React web applications.'
    },
    {
      seeker_id: seekerId,
      company_name: 'Startup Inc',
      job_title: 'Senior Frontend Developer',
      start_date: '2023-01-15',
      is_current_role: true,
      description: 'Leading the frontend architecture using Next.js and Tailwind.'
    }
  ]);

  // 9. Seeker Education
  console.log("Creating seeker education...");
  await supabase.from('seeker_education').insert([
    {
      seeker_id: seekerId,
      institution_name: 'State University',
      degree: 'B.S.',
      field_of_study: 'Computer Science',
      start_date: '2016-08-01',
      end_date: '2020-05-01'
    }
  ]);

  // 10. Seeker Skills
  console.log("Assigning seeker skills...");
  const seekerSkillsData = [];
  if (getSkillId('React')) seekerSkillsData.push({ seeker_id: seekerId, skill_id: getSkillId('React'), years_of_experience: 4, proficiency: 'expert' });
  if (getSkillId('Next.js')) seekerSkillsData.push({ seeker_id: seekerId, skill_id: getSkillId('Next.js'), years_of_experience: 2, proficiency: 'intermediate' });
  if (getSkillId('TypeScript')) seekerSkillsData.push({ seeker_id: seekerId, skill_id: getSkillId('TypeScript'), years_of_experience: 3, proficiency: 'expert' });
  
  await supabase.from('seeker_skills').insert(seekerSkillsData);

  // 11. Applications
  console.log("Creating applications...");
  const { data: applications, error: appError } = await supabase.from('applications').insert([
    {
      job_id: jobs[0].id,
      seeker_id: seekerId,
      cover_letter: 'I am very interested in this Senior Frontend Engineer role.',
      status: 'reviewing'
    }
  ]).select();

  if (appError) console.error("Error creating application:", appError.message);

  // 12. Interviews
  console.log("Creating interviews...");
  if (applications && applications.length > 0) {
    await supabase.from('interviews').insert([
      {
        application_id: applications[0].id,
        interviewer_id: employerId,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        interview_type: 'technical',
        notes: 'Candidate has strong React skills.'
      }
    ]);
  }

  console.log("✅ Database successfully seeded with all tables!");
  console.log("Employer Login -> Email: employer@test.com | Password: password123");
  console.log("Seeker Login   -> Email: seeker@test.com   | Password: password123");
}

seed();
