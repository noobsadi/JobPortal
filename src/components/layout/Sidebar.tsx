import { createClient } from '@/lib/supabase/server';
import { SidebarNav } from './SidebarNav';

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role || 'seeker';

  return <SidebarNav role={role} />;
}
