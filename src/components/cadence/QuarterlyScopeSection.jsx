import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthSection } from './MonthSection'

function summarize(months) {
  let total = 0, done = 0, blocked = 0
  for (const m of months) {
    for (const it of m.items) {
      total++
      if (it.status === 'done') done++
      else if (it.status === 'blocker' || it.status === 'stuck') blocked++
    }
  }
  return { total, done, blocked }
}

export function QuarterlyScopeSection({
  label, months, weekOptions,
  onDelete, onEditField, onMoveWeek, onAdd,
  forceOpen = false,
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])

  const { total, done, blocked } = summarize(months)

  return (
    <Card className="overflow-hidden mb-6 border-border/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative w-full flex items-center gap-3 px-4 md:px-5 py-3.5 text-left border-b border-border/60 bg-gradient-to-r from-rose-50/80 via-rose-50/20 to-transparent dark:from-rose-500/[0.09] dark:via-rose-500/[0.02] dark:to-transparent hover:from-rose-50 hover:via-rose-50/40 dark:hover:from-rose-500/[0.14] dark:hover:via-rose-500/[0.04] transition-colors duration-200"
        aria-expanded={open}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-rose-400 via-rose-500 to-pink-500 dark:from-rose-300 dark:via-rose-400 dark:to-pink-400 opacity-95"
        />
        <span className="text-rose-600/80 dark:text-rose-300/80 transition-transform duration-200 group-hover:translate-x-0.5">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-700/80 dark:text-rose-300/80">
          Quarterly Scope
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">{label}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums text-rose-800 dark:text-rose-100 bg-rose-100/70 dark:bg-rose-400/10 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-300/20">
          <span>{months.length} month{months.length === 1 ? '' : 's'}</span>
          <span>· {total} item{total === 1 ? '' : 's'}</span>
          {done > 0 && <span className="text-rose-700/70 dark:text-rose-200/70">· {done} done</span>}
          {blocked > 0 && <span className="text-rose-700 dark:text-rose-200">· {blocked} blocked</span>}
        </span>
      </button>

      {open && (
        <div className="p-3 md:p-4 bg-rose-50/20 dark:bg-rose-500/[0.02]">
          {months.map((m) => (
            <MonthSection
              key={m.key}
              label={m.label}
              items={m.items}
              weekOptions={weekOptions}
              monthWeekOptions={m.monthWeekOptions}
              defaultAddWeek={m.defaultAddWeek}
              defaultOpen={forceOpen}
              forceOpen={forceOpen}
              variant="quarter"
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
