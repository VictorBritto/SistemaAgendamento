import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hrwlxnojrhkdfrobxzib.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyd2x4bm9qcmhrZGZyb2J4emliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDkwMjMsImV4cCI6MjA5Nzk4NTAyM30.J6afMAfad0qMsd1Hds0hZ-oVcaduYvUuMR1lbyjKzZM'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
