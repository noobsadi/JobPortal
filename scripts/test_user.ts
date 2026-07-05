import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const e1 = data.users.find(u => u.email === 'seeker_1781580508688_0@example.com');
  const e2 = data.users.find(u => u.email === 'seeker_1781580509088_1@example.com');
  console.log("e1:", e1 ? "exists" : "missing");
  console.log("e2:", e2 ? "exists" : "missing");
  
  // print out the first 5 seeker emails available
  const seekerEmails = data.users.filter(u => u.email?.startsWith('seeker_')).map(u => u.email).slice(0, 5);
  console.log("\nSome valid emails:");
  console.log(seekerEmails.join('\n'));
}

checkUser();
