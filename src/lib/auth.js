import { supabase } from './supabase'

export async function signInWithGoogle() {
 const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
   redirectTo: `${window.location.origin}/`,
   queryParams: { prompt: 'select_account' },
  },
 })
 if (error) throw error
 return data
}

export async function signInWithEmail(email) {
 const { data, error } = await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: `${window.location.origin}/` },
 })
 if (error) throw error
 return data
}

export async function signOut() {
 await supabase.auth.signOut()
}

export async function isAllowed(email) {
 if (!email) return false
 const { data, error } = await supabase
  .from('alignment_allowed_emails')
  .select('email')
  .eq('email', email.toLowerCase())
  .maybeSingle()
 if (error) return false
 return !!data
}
