import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqxndspkpcjpzdedsnqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeG5kc3BrcGNqcHpkZWRzbnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjcyMTQsImV4cCI6MjA5ODQwMzIxNH0.pWlM_eOcWMGQcBznz5DUm2A7NYJBRuZUBXpcxMPouyI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
