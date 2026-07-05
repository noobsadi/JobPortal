import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

faker.seed(42);

const NUM_COMPANIES = 15;
const NUM_EMPLOYERS = 15;
const NUM_SEEKERS = 30;
const PASSWORD = 'Password123!';

const BANGLADESHI_FIRST_NAMES = [
  'Sakhawat', 'Tanvir', 'Rakib', 'Sadia', 'Nusrat', 'Nafis', 'Anika', 'Rahim', 'Karim',
  'Mahmudullah', 'Tamim', 'Mashrafe', 'Mustafizur', 'Mehidy', 'Litton', 'Mominul',
  'Taskin', 'Shoriful', 'Najmul', 'Towhid', 'Jaker', 'Shamim', 'Hasan', 'Rishad',
  'Tanzim', 'Tanzid', 'Fahim', 'Arif', 'Sumaiya', 'Jannatul', 'Farhana', 'Mehedi',
  'Shahriar', 'Imran', 'Faysal', 'Ashraful', 'Tarek', 'Rubel', 'Sabrina', 'Tasnim',
  'Sakib', 'Shakib', 'Mushfiqur', 'Anamul', 'Soumya', 'Habibur', 'Hasibul', 'Kazi',
  'Tariqul', 'Shafiqul', 'Rafiqul', 'Aminul', 'Rezaul', 'Nazmul', 'Kamrul', 'Saiful'
];

const BANGLADESHI_LAST_NAMES = [
  'Hosen', 'Ahmed', 'Rahman', 'Chowdhury', 'Khan', 'Islam', 'Uddin', 'Siddique',
  'Hasan', 'Alam', 'Ali', 'Hossain', 'Mia', 'Sikder', 'Talukder', 'Mozumder',
  'Bhuiyan', 'Akter', 'Khatun', 'Begum', 'Sultana', 'Sarkar', 'Biswas', 'Das',
  'Ghosh', 'Roy', 'Saha', 'Shil', 'Paul', 'Dutta', 'Dey', 'Sen', 'Sinha', 'Choudhury'
];

const BANGLADESHI_COMPANIES = [
  'Pathao', 'bKash', 'Nagad', 'Brain Station 23', 'TigerIT', 'Enosis Solutions',
  'Therap BD', 'Kaz Software', 'Selise', 'Vivasoft', 'Chaldal', 'ShopUp', 'SouthTech',
  'DataSoft', 'BJIT', 'Reve Systems', 'Appnext', 'Magnito Digital', 'TenMinuteSchool',
  'Shikho', 'Ollyo', 'Lead Academy', 'ShareTrip', 'Shohoz', 'Truck Lagbe', 'Arogga',
  'Sheba.xyz', 'Cramstack', 'Sigmind', 'Bondstein', 'Grameenphone', 'Robi', 'Banglalink'
];

const BANGLADESHI_LOCATIONS = [
  'Dhaka, Bangladesh', 'Chattogram, Bangladesh', 'Sylhet, Bangladesh',
  'Rajshahi, Bangladesh', 'Khulna, Bangladesh', 'Banani, Dhaka',
  'Gulshan, Dhaka', 'Mirpur, Dhaka', 'Uttara, Dhaka', 'Dhanmondi, Dhaka',
  'Motijheel, Dhaka', 'Mohakhali, Dhaka', 'Agrabad, Chattogram', 'Remote, Bangladesh'
];

const BANGLADESHI_UNIVERSITIES = [
  'BUET', 'Dhaka University', 'BRAC University', 'North South University',
  'IUT', 'SUST', 'Jahangirnagar University', 'Rajshahi University',
  'Ahsanullah University of Science and Technology', 'East West University',
  'Daffodil International University', 'AIUB', 'UIU', 'Khulna University', 'Chittagong University'
];

async function seed() {
  console.log('🚀 Starting database seed...');

  try {
    // 1. Fetch existing skills
    const { data: skills, error: skillsError } = await supabase.from('skills').select('id, name');
    if (skillsError) throw skillsError;
    if (!skills || skills.length === 0) {
      console.warn('⚠️ No skills found. Ensure you have run the schema.sql which seeds skills.');
    }
    const skillIds = skills?.map(s => s.id) || [];

    // 2. Generate Companies
    console.log(`🏢 Creating ${NUM_COMPANIES} companies...`);
    const companiesToInsert = Array.from({ length: NUM_COMPANIES }).map((_, idx) => ({
      name: BANGLADESHI_COMPANIES[idx % BANGLADESHI_COMPANIES.length] + (idx >= BANGLADESHI_COMPANIES.length ? ` ${Math.floor(idx / BANGLADESHI_COMPANIES.length) + 1}` : ''),
      industry: faker.helpers.arrayElement(['Engineering', 'Design', 'Data & AI', 'Marketing', 'Business', 'Finance', 'Healthcare']),
      description: faker.company.catchPhrase() + '. ' + faker.lorem.paragraph(),
      website_url: faker.internet.url(),
      logo_url: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
      founded_year: faker.date.past({ years: 20 }).getFullYear(),
    }));

    const { data: companies, error: compError } = await supabase
      .from('companies')
      .insert(companiesToInsert)
      .select();
    if (compError) throw compError;
    
    // 3. Generate Employers
    console.log(`👔 Creating ${NUM_EMPLOYERS} employers...`);
    const employerProfiles = [];
    for (let i = 0; i < NUM_EMPLOYERS; i++) {
      const email = `employer_${Date.now()}_${i}@example.com`;
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'employer' }
      });
      if (authErr) {
        console.error(`Failed to create employer ${email}:`, authErr.message);
        continue;
      }
      
      const companyId = faker.helpers.arrayElement(companies!).id;
      const title = faker.person.jobTitle();
      const isAdmin = faker.datatype.boolean();

      const { error: empProfErr } = await supabase
        .from('employer_profiles')
        .update({
          company_id: companyId,
          title_at_company: title,
          is_company_admin: isAdmin
        })
        .eq('user_id', authData.user.id);

      if (empProfErr) throw empProfErr;

      employerProfiles.push({
        user_id: authData.user.id,
        company_id: companyId,
        title_at_company: title,
        is_company_admin: isAdmin
      });
    }

    // 4. Generate Jobs
    console.log(`💼 Creating jobs...`);
    const jobsToInsert = [];
    for (const emp of employerProfiles) {
      const numJobs = faker.number.int({ min: 2, max: 5 });
      for (let j = 0; j < numJobs; j++) {
        jobsToInsert.push({
          posted_by_user_id: emp.user_id,
          company_id: emp.company_id,
          title: faker.person.jobTitle(),
          description: faker.lorem.paragraphs(3),
          job_type: faker.helpers.arrayElement(['full_time', 'part_time', 'contract', 'internship', 'remote']),
          location: faker.helpers.arrayElement(BANGLADESHI_LOCATIONS),
          salary_min: faker.number.int({ min: 50000, max: 90000 }),
          salary_max: faker.number.int({ min: 100000, max: 200000 }),
          status: faker.helpers.arrayElement(['open', 'open', 'open', 'closed']),
        });
      }
    }

    const { data: jobs, error: jobsErr } = await supabase.from('jobs').insert(jobsToInsert).select();
    if (jobsErr) throw jobsErr;

    // 5. Generate Job Skills
    console.log(`🔗 Assigning skills to jobs...`);
    const jobSkillsToInsert = [];
    for (const job of jobs!) {
      const numSkills = faker.number.int({ min: 2, max: 6 });
      const selectedSkills = faker.helpers.arrayElements(skillIds, numSkills);
      for (const skillId of selectedSkills) {
        jobSkillsToInsert.push({ job_id: job.id, skill_id: skillId });
      }
    }
    if (jobSkillsToInsert.length > 0) {
      const { error: jobSkillsErr } = await supabase.from('job_skills').insert(jobSkillsToInsert);
      if (jobSkillsErr) throw jobSkillsErr;
    }

    // 6. Generate Seekers
    console.log(`🧑‍💻 Creating ${NUM_SEEKERS} job seekers...`);
    const seekerProfiles = [];
    const seekerExperiences = [];
    const seekerEducations = [];
    const seekerSkills = [];
    const seekerIds: string[] = [];

    for (let i = 0; i < NUM_SEEKERS; i++) {
      const email = `seeker_${Date.now()}_${i}@example.com`;
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'seeker' }
      });
      if (authErr) {
        console.error(`Failed to create seeker ${email}:`, authErr.message);
        continue;
      }
      
      const userId = authData.user.id;
      seekerIds.push(userId);
      
      const { error: spErr } = await supabase
        .from('seeker_profiles')
        .update({
          first_name: faker.helpers.arrayElement(BANGLADESHI_FIRST_NAMES),
          last_name: faker.helpers.arrayElement(BANGLADESHI_LAST_NAMES),
          headline: faker.person.jobTitle(),
          bio: faker.lorem.paragraph(),
          location: faker.helpers.arrayElement(BANGLADESHI_LOCATIONS),
          github_url: `https://github.com/${faker.internet.username()}`,
          avatar_url: faker.image.avatar(),
        })
        .eq('user_id', userId);
      
      if (spErr) throw spErr;

      // Experience
      const numExp = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < numExp; j++) {
        seekerExperiences.push({
          seeker_id: userId,
          company_name: faker.helpers.arrayElement(BANGLADESHI_COMPANIES),
          job_title: faker.person.jobTitle(),
          start_date: faker.date.past({ years: 5 }).toISOString().split('T')[0],
          end_date: faker.datatype.boolean() ? faker.date.recent().toISOString().split('T')[0] : null,
          is_current_role: faker.datatype.boolean(),
          description: faker.lorem.sentences(2),
        });
      }

      // Education
      const numEdu = faker.number.int({ min: 1, max: 2 });
      for (let j = 0; j < numEdu; j++) {
        seekerEducations.push({
          seeker_id: userId,
          institution_name: faker.helpers.arrayElement(BANGLADESHI_UNIVERSITIES),
          degree: faker.helpers.arrayElement(['B.S.', 'M.S.', 'Ph.D.', 'B.A.']),
          field_of_study: faker.helpers.arrayElement(['Computer Science', 'Business', 'Design', 'Data Science']),
          start_date: faker.date.past({ years: 10 }).toISOString().split('T')[0],
          end_date: faker.date.past({ years: 2 }).toISOString().split('T')[0],
        });
      }

      // Skills
      const numSkills = faker.number.int({ min: 3, max: 8 });
      const selectedSkills = faker.helpers.arrayElements(skillIds, numSkills);
      for (const skillId of selectedSkills) {
        seekerSkills.push({
          seeker_id: userId,
          skill_id: skillId,
          proficiency: faker.helpers.arrayElement(['beginner', 'intermediate', 'expert']),
        });
      }
    }

    if (seekerExperiences.length > 0) {
      const { error: seErr } = await supabase.from('seeker_experience').insert(seekerExperiences);
      if (seErr) throw seErr;
    }
    if (seekerEducations.length > 0) {
      const { error: seduErr } = await supabase.from('seeker_education').insert(seekerEducations);
      if (seduErr) throw seduErr;
    }
    if (seekerSkills.length > 0) {
      const { error: ssErr } = await supabase.from('seeker_skills').insert(seekerSkills);
      if (ssErr) throw ssErr;
    }

    // 7. Generate Applications
    console.log(`📄 Generating applications...`);
    const applicationsToInsert = [];
    const openJobs = jobs!.filter(j => j.status === 'open');
    
    for (const seekerId of seekerIds) {
      const numApps = faker.number.int({ min: 2, max: 6 });
      const appliedJobs = faker.helpers.arrayElements(openJobs, Math.min(numApps, openJobs.length));
      
      for (const job of appliedJobs) {
        applicationsToInsert.push({
          job_id: job.id,
          seeker_id: seekerId,
          status: faker.helpers.arrayElement(['pending', 'reviewing', 'interviewing', 'offered', 'rejected']),
          cover_letter: faker.datatype.boolean() ? faker.lorem.paragraphs(2) : null,
        });
      }
    }

    const { data: applications, error: appErr } = await supabase.from('applications').insert(applicationsToInsert).select();
    if (appErr) throw appErr;

    // 8. Generate Interviews
    console.log(`🎙️ Scheduling interviews...`);
    const interviewsToInsert = [];
    const interviewedApps = applications!.filter(a => ['interviewing', 'offered'].includes(a.status));
    
    for (const app of interviewedApps) {
      interviewsToInsert.push({
        application_id: app.id,
        interview_type: faker.helpers.arrayElement(['technical', 'cultural', 'hr', 'final']),
        scheduled_at: faker.date.soon({ days: 14 }).toISOString(),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        feedback_score: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 5 }) : null,
      });
    }

    if (interviewsToInsert.length > 0) {
      const { error: intErr } = await supabase.from('interviews').insert(interviewsToInsert);
      if (intErr) throw intErr;
    }

    console.log(`✅ Seed completed successfully!`);
    console.log(`-----------------------------------`);
    console.log(`Inserted Data Summary:`);
    console.log(`- Companies: ${companies!.length}`);
    console.log(`- Employers: ${employerProfiles.length}`);
    console.log(`- Jobs: ${jobs!.length}`);
    console.log(`- Seekers: ${seekerIds.length}`);
    console.log(`- Applications: ${applications!.length}`);
    console.log(`- Interviews: ${interviewsToInsert.length}`);
    console.log(`-----------------------------------`);
    console.log(`Log in with any generated email (e.g. *.example.com) and password: ${PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

seed();
