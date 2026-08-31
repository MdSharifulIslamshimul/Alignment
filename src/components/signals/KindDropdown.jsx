import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
 { value: 'problem',     label: 'Problem' },
 { value: 'opportunity', label: 'Opportunity' },
]

const STYLE = {
 problem:     'text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-200 dark:bg-rose-500/10 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30',
 opportunity: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-500/10 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30',
}

export function KindDropdown({ value, onChange }) {
 const v = value === 'opportunity' ? 'opportunity' : 'problem'
 const opt = OPTIONS.find((o) => o.value === v) || OPTIONS[0]
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
    aria-label={`Kind: ${opt.label}`}
    onClick={() => setOpen((s) => !s)}
    className={cn(
     'inline-flex items-center justify-between gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-[112px]',
     STYLE[v]
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
        aria-selected={v === o.value}
        onClick={() => { onChange(o.value); setOpen(false) }}
        className={cn(
         'w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors duration-200',
         v === o.value && 'bg-accent/60 font-medium'
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
