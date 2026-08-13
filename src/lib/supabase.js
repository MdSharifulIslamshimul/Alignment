import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://cobynlvslbrvgrdagltp.supabase.co'
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_mT1frtkqIMYJ73DdEL9bBA_LRXv69Ab'

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const TABLE = {
  metrics: 'alignment_metrics',
  followUps: 'alignment_follow_ups',
  blockers: 'alignment_blockers',
}
