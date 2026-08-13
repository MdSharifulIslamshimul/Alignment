import { useEffect, useRef, useState } from 'react'
import { MoveRight } from 'lucide-react'

export function MoveMenu({ current, options, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('mousedown', onClick); window.removeEventListener('keydown', onKey) }
  }, [open])

  const choices = options.filter((w) => w !== current)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
        aria-label="Move to another week"
        title="Move to another week"
      >
        <MoveRight size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-40 min-w-[220px] bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in">
          <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Move to…</div>
          {choices.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No other weeks yet.</div>
          ) : (
            choices.map((w) => (
              <button
                key={w}
                onClick={() => { onSelect(w); setOpen(false) }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors duration-200"
              >
                {w}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
