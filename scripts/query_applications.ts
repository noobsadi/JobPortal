import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  const emails = users.users.filter(u => u.user_metadata?.role === 'seeker').map(u => u.email).slice(0, 10);
  console.log("Here are some valid seeker emails in the database right now:");
  emails.forEach(e => console.log(e));
}

run();
