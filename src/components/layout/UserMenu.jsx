import { useEffect, useRef, useState } from 'react'
import { LogOut, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthProvider'
import { signOut } from '@/lib/auth'

function initialsFrom(name, email) {
  const src = (name || email || '').trim()
  if (!src) return '?'
  const parts = src.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

function Avatar({ url, name, email, size = 32 }) {
  const [broken, setBroken] = useState(false)
  const initials = initialsFrom(name, email)
  const px = `${size}px`
  if (url && !broken) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setBroken(true)}
        className="rounded-full object-cover bg-muted"
        style={{ width: px, height: px }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white grid place-items-center font-semibold"
      style={{ width: px, height: px, fontSize: Math.max(10, size * 0.35) }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function UserMenu({ collapsed }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const email = user?.email || ''
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey) }
  }, [open])

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed && 'justify-center p-1'
        )}
        title={collapsed ? name || email : undefined}
      >
        <Avatar url={avatarUrl} name={name} email={email} size={collapsed ? 30 : 32} />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground truncate leading-tight">
                {name || email.split('@')[0]}
              </div>
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">{email}</div>
            </div>
            <ChevronsUpDown size={14} className="text-muted-foreground/70 shrink-0" />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 bg-card border border-border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.10)] py-1 animate-fade-in',
            collapsed ? 'left-[calc(100%+8px)] bottom-0 w-[240px]' : 'left-0 right-0 bottom-[calc(100%+6px)]'
          )}
        >
          <div className="px-3 py-2.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Avatar url={avatarUrl} name={name} email={email} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{name || email.split('@')[0]}</div>
                <div className="text-[11px] text-muted-foreground truncate">{email}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700">
              <Check size={12} strokeWidth={3} className="text-emerald-600" />
              <span>Signed in · authorized</span>
            </div>
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={() => { setOpen(false); signOut() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:bg-accent"
          >
            <LogOut size={14} className="text-muted-foreground" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
