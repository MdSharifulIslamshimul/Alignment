import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthRow } from './MonthRow'
import { AddRowInline } from './AddRowInline'
import { statusRank } from '@/lib/statusOrder'

const COLS = [
  { key: 'item',    label: 'Follow up / Blocker', width: '29%', align: 'left'   },
  { key: 'owner',   label: 'Owner',               width: '10%', align: 'left'   },
  { key: 'week',    label: 'Week',                width: '12%', align: 'center' },
  { key: 'status',  label: 'Status',              width: '12%', align: 'center' },
  { key: 'remarks', label: 'Remarks',             width: '32%', align: 'left'   },
  { key: 'actions', label: '',                    width: '5%',  align: 'right'  },
]

const VARIANTS = {
  current: {
    header: 'bg-gradient-to-r from-indigo-50/70 via-slate-50/30 to-transparent dark:from-indigo-500/[0.07] dark:via-slate-900/40 dark:to-transparent hover:from-indigo-50 hover:via-slate-50/50 dark:hover:from-indigo-500/[0.12] dark:hover:via-slate-900/60',
    rail: 'bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500 dark:from-indigo-400 dark:via-indigo-400 dark:to-violet-400 opacity-90',
    chevron: 'text-indigo-500/80 dark:text-indigo-300/80',
    eyebrow: null,
    chip: 'text-indigo-800 dark:text-indigo-100 bg-indigo-100/70 dark:bg-indigo-400/10 ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-300/20',
    chipMuted: 'text-indigo-700/60 dark:text-indigo-200/60',
  },
  scope: {
    header: 'bg-gradient-to-r from-amber-50/80 via-amber-50/20 to-transparent dark:from-amber-500/[0.09] dark:via-amber-500/[0.02] dark:to-transparent hover:from-amber-50 hover:via-amber-50/40 dark:hover:from-amber-500/[0.14] dark:hover:via-amber-500/[0.04]',
    rail: 'bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 dark:from-amber-300 dark:via-amber-400 dark:to-orange-400 opacity-95',
    chevron: 'text-amber-600/80 dark:text-amber-300/80',
    eyebrow: { label: 'Monthly Scope', className: 'text-amber-700/80 dark:text-amber-300/80' },
    chip: 'text-amber-800 dark:text-amber-100 bg-amber-100/70 dark:bg-amber-400/10 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-300/20',
    chipMuted: 'text-amber-700/70 dark:text-amber-200/70',
  },
  quarter: {
    header: 'bg-gradient-to-r from-rose-50/60 via-rose-50/10 to-transparent dark:from-rose-500/[0.07] dark:via-rose-500/[0.01] dark:to-transparent hover:from-rose-50/80 dark:hover:from-rose-500/[0.10]',
    rail: 'bg-gradient-to-b from-rose-300 via-rose-400 to-pink-400 dark:from-rose-400 dark:via-rose-400 dark:to-pink-400 opacity-90',
    chevron: 'text-rose-500/80 dark:text-rose-300/80',
    eyebrow: null,
    chip: 'text-rose-800 dark:text-rose-100 bg-rose-100/70 dark:bg-rose-400/10 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-300/20',
    chipMuted: 'text-rose-700/70 dark:text-rose-200/70',
  },
  unscheduled: {
    header: 'bg-gradient-to-r from-slate-50/80 via-slate-50/20 to-transparent dark:from-slate-500/[0.08] dark:via-slate-500/[0.02] dark:to-transparent hover:from-slate-50 dark:hover:from-slate-500/[0.14]',
    rail: 'bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 opacity-90',
    chevron: 'text-slate-500/80 dark:text-slate-300/80',
    eyebrow: null,
    chip: 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 ring-1 ring-inset ring-slate-200 dark:ring-slate-700',
    chipMuted: 'text-slate-600/70 dark:text-slate-300/70',
  },
}

function summarize(items) {
  let total = items.length, done = 0, blocked = 0
  for (const it of items) {
    if (it.status === 'done') done++
    else if (it.status === 'blocker' || it.status === 'stuck') blocked++
  }
  return { total, done, blocked }
}

export function MonthSection({
  label, items, weekOptions, monthWeekOptions, defaultAddWeek,
  onDelete, onEditField, onMoveWeek, onAdd,
  defaultOpen = true, forceOpen = false, variant = 'current',
}) {
  const [open, setOpen] = useState(defaultOpen)
  useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])

  const v = VARIANTS[variant] || VARIANTS.current
  const { total, done, blocked } = summarize(items)

  return (
    <Card className="overflow-hidden mb-6 border-border/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group relative w-full flex items-center gap-3 px-4 md:px-5 py-3.5 text-left border-b border-border/60 transition-colors duration-200 ${v.header}`}
        aria-expanded={open}
      >
        <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${v.rail}`} />
        <span className={`${v.chevron} transition-transform duration-200 group-hover:translate-x-0.5`}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {v.eyebrow && (
          <span className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${v.eyebrow.className}`}>
            {v.eyebrow.label}
          </span>
        )}
        <span className="text-[15px] font-semibold tracking-tight text-foreground">{label}</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${v.chip}`}>
          <span>{total} item{total === 1 ? '' : 's'}</span>
          {done > 0 && <span className={v.chipMuted}>· {done} done</span>}
          {blocked > 0 && <span className="text-rose-600 dark:text-rose-300">· {blocked} blocked</span>}
        </span>
      </button>

      {open && (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>{COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
            <thead className="bg-muted/40 dark:bg-muted/20">
              <tr>
                {COLS.map((c, i) => (
                  <th
                    key={c.key}
                    className={
                      `px-4 py-3 text-${c.align} text-[13px] font-semibold text-foreground/70` +
                      (i < COLS.length - 1 ? ' border-r border-border/60' : '')
                    }
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No items yet.
                  </td>
                </tr>
              ) : (
                items.flatMap((f, i) => {
                  const prev = items[i - 1]
                  const rowsForItem = []
                  if (prev && statusRank(prev.status) !== statusRank(f.status)) {
                    rowsForItem.push(
                      <tr key={`div-${f.id}`} aria-hidden="true">
                        <td colSpan={COLS.length} className="p-0">
                          <div className="h-1.5 bg-muted/50 dark:bg-muted/25" />
                        </td>
                      </tr>
                    )
                  }
                  rowsForItem.push(
                    <MonthRow
                      key={f.id}
                      f={f}
                      weekOptions={weekOptions}
                      onDelete={onDelete}
                      onEditField={onEditField}
                      onMoveWeek={onMoveWeek}
                    />
                  )
                  return rowsForItem
                })
              )}
            </tbody>
          </table>
          {onAdd && (
            <AddRowInline
              weekOptions={monthWeekOptions}
              defaultWeek={defaultAddWeek}
              onAdd={onAdd}
            />
          )}
        </div>
      )}
    </Card>
  )
}
