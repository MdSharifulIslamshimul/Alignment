import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'stuck',       label: 'Stuck' },
  { value: 'done',        label: 'Done' },
]

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
        className="inline-flex items-center justify-between gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-[112px]"
      >
        <span>{opt.label}</span>
        <ChevronDown size={11} strokeWidth={2.5} className="opacity-60 shrink-0" />
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
