import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
 { value: 'new',       label: 'New' },
 { value: 'exploring', label: 'Exploring' },
 { value: 'decided',   label: 'Decided' },
 { value: 'dismissed', label: 'Dismissed' },
]

const STYLE = {
 new:       'text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800',
 exploring: 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40',
 decided:   'text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-950/40',
 dismissed: 'text-muted-foreground bg-muted/60 hover:bg-muted dark:text-muted-foreground dark:bg-muted/40',
}

const normalize = (s) => (STYLE[s] ? s : 'new')

export function SignalStatusDropdown({ status, onChange }) {
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
    aria-label={`Status: ${opt.label}`}
    onClick={() => setOpen((v) => !v)}
    className={cn(
     'inline-flex items-center justify-between gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-[112px]',
     STYLE[value]
    )}
   >
    <span>{opt.label}</span>
    <ChevronDown size={11} strokeWidth={2.5} className="opacity-70 shrink-0" />
   </button>
   {open && (
    <ul role="listbox" className="absolute left-0 top-8 z-40 min-w-[140px] bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in">
     {OPTIONS.map((o) => (
      <li key={o.value}>
       <button
        type="button"
        role="option"
        aria-selected={value === o.value}
        onClick={() => { onChange(o.value); setOpen(false) }}
        className={cn(
         'w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors duration-200',
         value === o.value && 'bg-accent/60 font-medium'
        )}
       >
        {o.label}
       </button>
      </li>
     ))}
    </ul>
   )}
  </div>
 )
}

export const SIGNAL_STATUS_ORDER = { new: 0, exploring: 1, decided: 2, dismissed: 3 }
export function signalStatusRank(s) {
 return SIGNAL_STATUS_ORDER[s] ?? SIGNAL_STATUS_ORDER.new
}
