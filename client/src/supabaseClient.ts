import { createClient } from '@supabase/supabase-js'

// Fallback to placeholders to prevent app crash (White Screen) if Env Vars are missing
// This allows the UI to load and show the Debug Banner.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase URL missing. App will run in degraded mode.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
