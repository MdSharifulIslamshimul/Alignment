import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthSection } from './MonthSection'

const VARIANTS = {
  current: {
    header: 'bg-gradient-to-r from-indigo-50/80 via-violet-50/30 to-transparent dark:from-indigo-500/[0.10] dark:via-violet-500/[0.03] dark:to-transparent hover:from-indigo-50 hover:via-violet-50/40 dark:hover:from-indigo-500/[0.15] dark:hover:via-violet-500/[0.05]',
    rail: 'bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500 dark:from-indigo-400 dark:via-indigo-400 dark:to-violet-400 opacity-95',
    chevron: 'text-indigo-500/80 dark:text-indigo-300/80',
    eyebrow: 'text-indigo-700/80 dark:text-indigo-300/85',
    chip: 'text-indigo-800 dark:text-indigo-100 bg-indigo-100/70 dark:bg-indigo-400/10 ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-300/20',
    chipMuted: 'text-indigo-700/70 dark:text-indigo-200/70',
    bodyBg: 'bg-indigo-50/25 dark:bg-indigo-500/[0.02]',
  },
  past: {
    header: 'bg-gradient-to-r from-rose-50/70 via-rose-50/20 to-transparent dark:from-rose-500/[0.08] dark:via-rose-500/[0.02] dark:to-transparent hover:from-rose-50 hover:via-rose-50/40 dark:hover:from-rose-500/[0.12] dark:hover:via-rose-500/[0.04]',
    rail: 'bg-gradient-to-b from-rose-300 via-rose-400 to-pink-400 dark:from-rose-400 dark:via-rose-400 dark:to-pink-400 opacity-90',
    chevron: 'text-rose-500/80 dark:text-rose-300/80',
    eyebrow: 'text-rose-700/75 dark:text-rose-300/80',
    chip: 'text-rose-800 dark:text-rose-100 bg-rose-100/70 dark:bg-rose-400/10 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-300/20',
    chipMuted: 'text-rose-700/70 dark:text-rose-200/70',
    bodyBg: 'bg-rose-50/20 dark:bg-rose-500/[0.02]',
  },
}

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
  defaultOpen = false, forceOpen = false, variant = 'past',
}) {
  const [open, setOpen] = useState(defaultOpen)
  useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])

  const v = VARIANTS[variant] || VARIANTS.past
  const { total, done, blocked } = summarize(months)

  return (
    <Card className="overflow-hidden mb-6 border-border/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group relative w-full flex items-center gap-3 px-4 md:px-5 py-4 text-left border-b border-border/60 transition-colors duration-200 ${v.header}`}
        aria-expanded={open}
      >
        <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${v.rail}`} />
        <span className={`${v.chevron} transition-transform duration-200 group-hover:translate-x-0.5`}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${v.eyebrow}`}>
          Quarterly Scope
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-foreground truncate">{label}</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums shrink-0 ${v.chip}`}>
          <span>{months.length} month{months.length === 1 ? '' : 's'}</span>
          <span>· {total} item{total === 1 ? '' : 's'}</span>
          {done > 0 && <span className={v.chipMuted}>· {done} done</span>}
          {blocked > 0 && <span className="text-rose-600 dark:text-rose-300">· {blocked} blocked</span>}
        </span>
      </button>

      {open && (
        <div className={`p-3 md:p-4 ${v.bodyBg}`}>
          {months.map((m) => (
            <MonthSection
              key={m.key}
              label={m.label}
              items={m.items}
              weekOptions={weekOptions}
              monthWeekOptions={m.monthWeekOptions}
              defaultAddWeek={m.defaultAddWeek}
              defaultOpen={m.isCurrent || forceOpen}
              forceOpen={forceOpen}
              variant={m.isCurrent ? 'current' : 'scope'}
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
