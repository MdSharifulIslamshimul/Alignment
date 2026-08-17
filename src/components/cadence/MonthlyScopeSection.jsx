import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { WeekSection } from './WeekSection'

function summarize(weeks) {
  let total = 0, done = 0, blocked = 0
  for (const w of weeks) {
    for (const it of w.items) {
      total++
      if (it.status === 'done') done++
      else if (it.status === 'blocker' || it.status === 'stuck') blocked++
    }
  }
  return { total, done, blocked }
}

export function MonthlyScopeSection({
  label, weeks, weekOptions,
  onDelete, onEditField, onMoveWeek, onAdd,
  forceOpen = false,
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])

  const { total, done, blocked } = summarize(weeks)

  return (
    <Card className="overflow-hidden mb-6 border-border/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative w-full flex items-center gap-3 px-4 md:px-5 py-3.5 text-left border-b border-border/60 bg-gradient-to-r from-amber-50/80 via-amber-50/20 to-transparent dark:from-amber-500/[0.09] dark:via-amber-500/[0.02] dark:to-transparent hover:from-amber-50 hover:via-amber-50/40 dark:hover:from-amber-500/[0.14] dark:hover:via-amber-500/[0.04] transition-colors duration-200"
        aria-expanded={open}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 dark:from-amber-300 dark:via-amber-400 dark:to-orange-400 opacity-95"
        />
        <span className="text-amber-600/80 dark:text-amber-300/80 transition-transform duration-200 group-hover:translate-x-0.5">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700/80 dark:text-amber-300/80">
          Monthly Scope
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          {label}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums text-amber-800 dark:text-amber-100 bg-amber-100/70 dark:bg-amber-400/10 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-300/20">
          <span>{total} item{total === 1 ? '' : 's'}</span>
          {done > 0 && <span className="text-amber-700/70 dark:text-amber-200/70">· {done} done</span>}
          {blocked > 0 && <span className="text-rose-600 dark:text-rose-300">· {blocked} blocked</span>}
        </span>
      </button>

      {open && (
        <div className="p-3 md:p-4 space-y-0 bg-amber-50/20 dark:bg-amber-500/[0.02]">
          {weeks.map((w) => (
            <WeekSection
              key={w.label}
              label={w.label}
              items={w.items}
              weekOptions={weekOptions}
              defaultOpen={forceOpen}
              onDelete={onDelete}
              onEditField={onEditField}
              onMoveWeek={onMoveWeek}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
