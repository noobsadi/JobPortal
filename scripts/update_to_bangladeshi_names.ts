import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BANGLADESHI_FIRST_NAMES = [
  'Sakhawat', 'Tanvir', 'Rakib', 'Sadia', 'Nusrat', 'Nafis', 'Anika', 'Rahim', 'Karim',
  'Mahmudullah', 'Tamim', 'Mashrafe', 'Mustafizur', 'Mehidy', 'Litton', 'Mominul',
  'Taskin', 'Shoriful', 'Najmul', 'Towhid', 'Jaker', 'Shamim', 'Hasan', 'Rishad',
  'Tanzim', 'Tanzid', 'Fahim', 'Arif', 'Sumaiya', 'Jannatul', 'Farhana', 'Mehedi',
  'Shahriar', 'Imran', 'Faysal', 'Ashraful', 'Tarek', 'Rubel', 'Sabrina', 'Tasnim',
  'Sakib', 'Shakib', 'Mushfiqur', 'Anamul', 'Soumya', 'Habibur', 'Hasibul', 'Kazi',
  'Tariqul', 'Shafiqul', 'Rafiqul', 'Aminul', 'Rezaul', 'Nazmul', 'Kamrul', 'Saiful',
  'Zahidul', 'Shariful', 'Ariful', 'Monirul', 'Shahidul', 'Rabiul', 'Samiul', 'Ahsan',
  'Nayeem', 'Naeem', 'Sabbir', 'Jubair', 'Zubair', 'Rashed', 'Masud', 'Mamun', 'Mahfuz',
  'Sazzad', 'Shuvo', 'Akash', 'Sagar', 'Niloy', 'Hridoy', 'Joy', 'Bijoy', 'Parvez',
  'Sohel', 'Jewel', 'Rana', 'Rasel', 'Sumon', 'Milon', 'Liton', 'Tuhin', 'Selim'
];

const BANGLADESHI_LAST_NAMES = [
  'Hosen', 'Ahmed', 'Rahman', 'Chowdhury', 'Khan', 'Islam', 'Uddin', 'Siddique',
  'Hasan', 'Alam', 'Ali', 'Hossain', 'Mia', 'Sikder', 'Talukder', 'Mozumder',
  'Bhuiyan', 'Akter', 'Khatun', 'Begum', 'Sultana', 'Sarkar', 'Biswas', 'Das',
  'Ghosh', 'Roy', 'Saha', 'Shil', 'Paul', 'Dutta', 'Dey', 'Sen', 'Sinha', 'Choudhury',
  'Miah', 'Akhter', 'Sarker', 'Bhattacharya', 'Mukherjee', 'Chatterjee', 'Talukdar'
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

const BANGLADESHI_NAMES_SET = new Set([
  'sakhawat', 'sazid', 'sadman', 'sadi', 'mohammad', 'mohammed', 'md', 'md.', 'animesh', 'singha', 'tukabbir', 'ayon',
  ...BANGLADESHI_FIRST_NAMES.map(n => n.toLowerCase()),
  ...BANGLADESHI_LAST_NAMES.map(n => n.toLowerCase())
]);

function isBangladeshiName(first: string, last: string, email: string): boolean {
  if (email && (email.endsWith('@gmail.com') || email.endsWith('@yahoo.com') || email.endsWith('@outlook.com') || email.endsWith('@hotmail.com'))) {
    return true; // Preserve real user signups
  }
  const cleanFirst = (first || '').trim().toLowerCase();
  const cleanLast = (last || '').trim().toLowerCase();
  
  if (BANGLADESHI_NAMES_SET.has(cleanFirst) || BANGLADESHI_NAMES_SET.has(cleanLast)) {
    return true;
  }
  return false;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function updateDatabase() {
  console.log("🚀 Starting database update to Bangladeshi names...\n");

  // 1. Fetch Users to map user_id -> email
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) {
    console.error("❌ Error fetching users:", usersErr.message);
    return;
  }
  const emailMap = new Map<string, string>();
  usersData.users.forEach(u => {
    if (u.email) emailMap.set(u.id, u.email);
  });

  // 2. Update Seeker Profiles
  console.log("🧑‍💻 Checking Seeker Profiles...");
  const { data: seekers, error: seekersErr } = await supabase.from('seeker_profiles').select('*');
  if (seekersErr) {
    console.error("❌ Error fetching seeker profiles:", seekersErr.message);
  } else if (seekers) {
    let keptCount = 0;
    let updatedCount = 0;

    for (const seeker of seekers) {
      const email = emailMap.get(seeker.user_id) || '';
      if (isBangladeshiName(seeker.first_name, seeker.last_name, email)) {
        console.log(` ✅ Keeping Bangladeshi name: "${seeker.first_name} ${seeker.last_name}" (${email || 'no email'})`);
        keptCount++;
      } else {
        const newFirst = getRandomElement(BANGLADESHI_FIRST_NAMES);
        const newLast = getRandomElement(BANGLADESHI_LAST_NAMES);
        const newLocation = getRandomElement(BANGLADESHI_LOCATIONS);

        const { error: updErr } = await supabase
          .from('seeker_profiles')
          .update({
            first_name: newFirst,
            last_name: newLast,
            location: newLocation
          })
          .eq('user_id', seeker.user_id);

        if (updErr) {
          console.error(` ❌ Failed to update seeker ${seeker.user_id}:`, updErr.message);
        } else {
          console.log(` 🔄 Updated "${seeker.first_name} ${seeker.last_name}" -> "${newFirst} ${newLast}" (${newLocation})`);
          updatedCount++;
        }
      }
    }
    console.log(`\n📊 Seeker Profiles Summary: Kept ${keptCount}, Updated ${updatedCount}\n`);
  }

  // 3. Update Companies
  console.log("🏢 Checking Companies...");
  const { data: companies, error: compErr } = await supabase.from('companies').select('*');
  if (compErr) {
    console.error("❌ Error fetching companies:", compErr.message);
  } else if (companies) {
    let compUpdated = 0;
    const companySet = new Set(BANGLADESHI_COMPANIES.map(c => c.toLowerCase()));

    for (let i = 0; i < companies.length; i++) {
      const comp = companies[i];
      if (companySet.has(comp.name.toLowerCase())) {
        continue;
      }
      const newName = BANGLADESHI_COMPANIES[i % BANGLADESHI_COMPANIES.length] + (i >= BANGLADESHI_COMPANIES.length ? ` ${Math.floor(i / BANGLADESHI_COMPANIES.length) + 1}` : '');
      const { error: updErr } = await supabase
        .from('companies')
        .update({ name: newName })
        .eq('id', comp.id);

      if (!updErr) compUpdated++;
    }
    console.log(`📊 Companies Summary: Updated ${compUpdated} companies to Bangladeshi tech companies\n`);
  }

  // 4. Update Jobs Locations
  console.log("💼 Checking Jobs Locations...");
  const { data: jobs, error: jobsErr } = await supabase.from('jobs').select('*');
  if (jobsErr) {
    console.error("❌ Error fetching jobs:", jobsErr.message);
  } else if (jobs) {
    let jobsUpdated = 0;
    for (const job of jobs) {
      if (job.location && !job.location.includes('Bangladesh') && job.location !== 'Remote') {
        const newLoc = getRandomElement(BANGLADESHI_LOCATIONS);
        const { error: updErr } = await supabase
          .from('jobs')
          .update({ location: newLoc })
          .eq('id', job.id);
        if (!updErr) jobsUpdated++;
      }
    }
    console.log(`📊 Jobs Summary: Updated ${jobsUpdated} job locations to Bangladesh\n`);
  }

  // 5. Update Seeker Experience
  console.log("📜 Checking Seeker Experience Companies...");
  const { data: expList, error: expErr } = await supabase.from('seeker_experience').select('*');
  if (expErr) {
    console.error("❌ Error fetching seeker experience:", expErr.message);
  } else if (expList) {
    let expUpdated = 0;
    for (const exp of expList) {
      if (!BANGLADESHI_COMPANIES.includes(exp.company_name)) {
        const newComp = getRandomElement(BANGLADESHI_COMPANIES);
        const { error: updErr } = await supabase
          .from('seeker_experience')
          .update({ company_name: newComp })
          .eq('id', exp.id);
        if (!updErr) expUpdated++;
      }
    }
    console.log(`📊 Seeker Experience Summary: Updated ${expUpdated} records\n`);
  }

  // 6. Update Seeker Education
  console.log("🎓 Checking Seeker Education Institutions...");
  const { data: eduList, error: eduErr } = await supabase.from('seeker_education').select('*');
  if (eduErr) {
    console.error("❌ Error fetching seeker education:", eduErr.message);
  } else if (eduList) {
    let eduUpdated = 0;
    for (const edu of eduList) {
      if (!BANGLADESHI_UNIVERSITIES.includes(edu.institution_name)) {
        const newEdu = getRandomElement(BANGLADESHI_UNIVERSITIES);
        const { error: updErr } = await supabase
          .from('seeker_education')
          .update({ institution_name: newEdu })
          .eq('id', edu.id);
        if (!updErr) eduUpdated++;
      }
    }
    console.log(`📊 Seeker Education Summary: Updated ${eduUpdated} records\n`);
  }

  console.log("✅ Database successfully updated with Bangladeshi names while preserving existing Bangladeshi names!");
}

updateDatabase();
