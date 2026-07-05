import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNames() {
  console.log("=== Checking Seeker Profiles ===");
  const { data: seekers, error: seekersErr } = await supabase
    .from('seeker_profiles')
    .select('user_id, first_name, last_name, location');
  if (seekersErr) console.error("Seeker error:", seekersErr.message);
  else {
    console.log(`Found ${seekers?.length || 0} seeker profiles:`);
    seekers?.forEach(s => console.log(` - [${s.user_id}] "${s.first_name}" "${s.last_name}" (${s.location})`));
  }
}

checkNames();
