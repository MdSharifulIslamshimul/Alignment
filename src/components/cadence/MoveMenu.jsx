import { useEffect, useMemo, useRef, useState } from 'react'
import { MoveRight } from 'lucide-react'
import { mondayFromLabelSmart, mondayOf, weekLabelFromDate } from '@/lib/week'

export function MoveMenu({ current, options, onSelect }) {
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

  const { upcoming, past } = useMemo(() => {
    const today = new Date()
    const currentMonday = mondayOf(today).getTime()
    const currentLabel = weekLabelFromDate(today)
    const withMonday = options
      .filter((w) => w !== current)
      .map((w) => ({ label: w, monday: mondayFromLabelSmart(w, today)?.getTime() ?? null }))
    const upcoming = withMonday
      .filter((w) => w.monday !== null && w.monday >= currentMonday)
      .sort((a, b) => a.monday - b.monday)
      .map((w) => ({ ...w, isCurrent: w.label === currentLabel }))
    const past = withMonday
      .filter((w) => w.monday !== null && w.monday < currentMonday)
      .sort((a, b) => b.monday - a.monday)
    const noMonday = withMonday.filter((w) => w.monday === null)
    return { upcoming: [...upcoming, ...noMonday], past }
  }, [options, current])

  const choices = options.filter((w) => w !== current)

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Move to another week"
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoveRight size={13} />
      </button>
      {!open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-[calc(100%+4px)] whitespace-nowrap rounded-md bg-foreground text-background text-[11px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-40"
        >
          Move to another week
        </span>
      )}
      {open && (
        <div className="absolute right-0 top-8 z-40 min-w-[240px] max-h-[360px] overflow-y-auto bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in">
          {choices.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No other weeks yet.</div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-[0.08em]">This & upcoming</div>
                  {upcoming.map((w) => (
                    <button
                      key={w.label}
                      onClick={() => { onSelect(w.label); setOpen(false) }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors duration-200 flex items-center gap-2"
                    >
                      <span>{w.label}</span>
                      {w.isCurrent && (
                        <span className="ml-auto text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
                          This week
                        </span>
                      )}
                    </button>
                  ))}
                </>
              )}
              {past.length > 0 && (
                <>
                  {upcoming.length > 0 && <div className="my-1 border-t border-border/60" />}
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-amber-700/80 dark:text-amber-300/80 uppercase tracking-[0.08em]">Past weeks</div>
                  {past.map((w) => (
                    <button
                      key={w.label}
                      onClick={() => { onSelect(w.label); setOpen(false) }}
                      className="w-full text-left px-3 py-1.5 text-sm text-foreground/85 hover:bg-accent transition-colors duration-200"
                    >
                      {w.label}
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
