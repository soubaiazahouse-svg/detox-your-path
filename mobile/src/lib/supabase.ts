import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xphzwtargiugjyxmhfmv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_C_4nrDzRMeAz5P9Vh6WfKg_8NAUsJ1F';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
