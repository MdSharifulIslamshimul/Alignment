import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { isAllowed, signOut } from './auth'

const AuthCtx = createContext({ user: null, allowed: false, status: 'loading', signOut: () => {} })

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null)
 const [allowed, setAllowed] = useState(false)
 const [status, setStatus] = useState('loading')

 useEffect(() => {
  let mounted = true
  const check = async (session) => {
   const u = session?.user || null
   if (!mounted) return
   setUser(u)
   if (!u) { setAllowed(false); setStatus('anon'); return }
   const ok = await isAllowed(u.email)
   if (!mounted) return
   setAllowed(ok)
   setStatus(ok ? 'ready' : 'denied')
  }

  supabase.auth.getSession().then(({ data }) => check(data.session))
  const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => check(session))
  return () => { mounted = false; sub.subscription.unsubscribe() }
 }, [])

 return (
  <AuthCtx.Provider value={{ user, allowed, status, signOut }}>
   {children}
  </AuthCtx.Provider>
 )
}

export const useAuth = () => useContext(AuthCtx)
