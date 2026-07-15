import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// When the two env vars are set, we sync to Supabase (shared, live for everyone).
// When they're missing, `supabase` is null and db.js falls back to localStorage.
export const supabase = url && key ? createClient(url, key) : null
export const isOnline = !!supabase
