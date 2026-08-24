import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { weekChipClass, weekRelativeLabel } from '@/lib/weekColor'

const parseRange = (label) => (label ? label.replace(/^W\d+\s*:\s*/, '').trim() || label : '')
const parseCode = (label) => (label ? (label.match(/^(W\d+)/)?.[1] || '') : '')

export function WeekPicker({ value, options, onChange, className }) {
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

  const selectedRange = parseRange(value) || '—'
  const selectedRel = weekRelativeLabel(value)

  return (
    <div className={cn('relative inline-block', className)} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Week: ${value || 'none'}`}
        title={[parseCode(value), selectedRel].filter(Boolean).join(' · ')}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center justify-between gap-1.5 rounded-md px-2.5 h-8 text-xs font-semibold tabular-nums transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-[144px] ring-1 ring-inset',
          weekChipClass(value)
        )}
      >
        <span className="truncate">{selectedRange}</span>
        <ChevronDown size={12} strokeWidth={2.5} className="opacity-70 shrink-0" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-9 z-40 min-w-[240px] max-h-[320px] overflow-y-auto bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in"
        >
          {options.map((w) => {
            const range = parseRange(w)
            const rel = weekRelativeLabel(w)
            const isSelected = w === value
            return (
              <li key={w}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(w); setOpen(false) }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors duration-200 flex items-center gap-2',
                    isSelected && 'bg-accent/60 font-medium'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums ring-1 ring-inset whitespace-nowrap',
                      weekChipClass(w)
                    )}
                  >
                    {range}
                  </span>
                  {rel && <span className="ml-auto text-[10px] text-muted-foreground">{rel}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
