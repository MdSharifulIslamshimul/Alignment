import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: '',         label: '—',        style: 'text-muted-foreground bg-transparent border border-border' },
  { value: 'No',       label: 'No',       style: 'text-foreground bg-card border border-border hover:bg-muted' },
  { value: 'On track', label: 'On track', style: 'text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40' },
  { value: 'At risk',  label: 'At risk',  style: 'text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40' },
  { value: 'Yes',      label: 'Yes',      style: 'text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40' },
  { value: 'Exceeded', label: 'Exceeded', style: 'text-background bg-foreground border border-foreground hover:bg-foreground/90' },
  { value: 'Missed',   label: 'Missed',   style: 'text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 dark:text-red-300 dark:bg-red-950/40' },
]

export function AchievedDropdown({ value, onChange }) {
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
          'inline-flex items-center justify-between gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-[104px]',
          opt.style
        )}
      >
        <span>{opt.label}</span>
        <ChevronDown size={11} strokeWidth={2.5} className="opacity-70 shrink-0" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 top-8 z-40 min-w-[140px] bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in">
          {OPTIONS.map((o) => (
            <li key={o.value || 'none'}>
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
