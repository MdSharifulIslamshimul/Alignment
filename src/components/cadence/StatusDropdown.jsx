import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'stuck',       label: 'Stuck' },
  { value: 'done',        label: 'Done' },
]

const STYLE = {
  not_started: 'text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800',
  in_progress: 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40',
  stuck:       'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40',
  done:        'text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-950/40',
}
const DOT = {
  not_started: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  stuck:       'bg-amber-500',
  done:        'bg-green-500',
}

const normalize = (s) => (s === 'open' ? 'not_started' : (s || 'not_started'))

export function StatusDropdown({ status, onChange }) {
  const value = normalize(status)
  const opt = OPTIONS.find((o) => o.value === value) || OPTIONS[0]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          STYLE[value]
        )}
      >
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full', DOT[value])} />
        <span>{opt.label}</span>
        <ChevronDown size={11} strokeWidth={2.5} className="opacity-70" />
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 top-7 z-40 min-w-[140px] bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in">
          {OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors duration-200 flex items-center gap-2',
                  value === o.value && 'bg-accent/60 font-medium'
                )}
              >
                <span className={cn('inline-block h-1.5 w-1.5 rounded-full', DOT[o.value])} />
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
