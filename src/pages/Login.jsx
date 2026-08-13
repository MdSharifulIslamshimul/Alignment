import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useAuth } from '@/lib/AuthProvider'
import { signInWithGoogle, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'

function GoogleG(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.06 12.25c0-.83-.07-1.63-.21-2.4H12v4.55h6.2a5.32 5.32 0 0 1-2.3 3.49v2.9h3.72c2.18-2.01 3.44-4.96 3.44-8.54Z" />
      <path fill="#34A853" d="M12 23c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.9c-1.03.7-2.36 1.11-3.88 1.11-2.98 0-5.5-2.01-6.4-4.72H1.76v2.96A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.6 13.7A6.62 6.62 0 0 1 5.23 12c0-.59.1-1.16.27-1.7V7.34H1.76A11 11 0 0 0 1 12c0 1.77.43 3.44 1.18 4.92l3.42-3.22Z" />
      <path fill="#EA4335" d="M12 5.38c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.99 15.1 1 12 1A11 11 0 0 0 1.76 7.34l3.84 2.96C6.5 7.39 9.02 5.38 12 5.38Z" />
    </svg>
  )
}

export default function Login() {
  const { user, status } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  if (status === 'ready') return <Navigate to="/cadence" replace />

  const doGoogle = async () => {
    setErr(null); setBusy(true)
    try { await signInWithGoogle() }
    catch (e) { setErr(e.message || 'Sign-in failed. Try again in a moment.') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f7] px-5">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        <div className="h-16 w-16 rounded-[18px] bg-blue-500 grid place-items-center shadow-sm">
          <Compass size={32} className="text-white" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-[24px] font-bold tracking-[-0.02em] leading-none">Neeva</h1>
        <p className="mt-2 text-[15px] text-foreground/80 leading-tight">Business Command Center</p>
        <p className="mt-1 text-xs text-muted-foreground">Authorized accounts only</p>

        {status === 'denied' ? (
          <div className="mt-7 w-full bg-card border border-border rounded-2xl p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="text-sm font-medium">Not on the allowlist</div>
            <div className="mt-1 text-xs text-muted-foreground">Signed in as {user?.email}. Ask the admin to add your address.</div>
            <Button size="sm" variant="secondary" className="mt-4" onClick={() => signOut()}>Sign out</Button>
          </div>
        ) : (
          <div className="mt-7 w-full bg-card border border-border rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={doGoogle}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 h-11 text-[14px] font-medium hover:bg-muted/40 transition-colors duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GoogleG /> Sign in with Google
            </button>
            {err && <div className="mt-3 text-xs text-destructive text-center">{err}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
