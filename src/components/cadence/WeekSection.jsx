import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { FollowUpRow } from './FollowUpRow'
import { AddRowInline } from './AddRowInline'

const COLS = [
  { key: 'item',    label: 'Follow up / Blocker', width: '40%' },
  { key: 'owner',   label: 'Owner',               width: '10%' },
  { key: 'status',  label: 'Status',              width: '10%' },
  { key: 'remarks', label: 'Remarks',             width: '35%' },
  { key: 'actions', label: '',                    width: '5%' },
]

function parseLabel(label) {
  const m = label.match(/^(W\d+)\s*[:.\-]?\s*(.+)$/)
  return m ? { code: m[1], range: m[2] } : { code: '', range: label }
}

export function WeekSection({
  label, items, weekOptions,
  onDelete, onEditField, onMoveWeek, onAdd,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const { code, range } = parseLabel(label)

  return (
    <Card className="overflow-hidden mb-6 border-border/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative w-full flex items-center gap-3 px-4 md:px-5 py-3.5 text-left border-b border-border/60 bg-gradient-to-r from-indigo-50/70 via-slate-50/30 to-transparent dark:from-indigo-500/[0.07] dark:via-slate-900/40 dark:to-transparent hover:from-indigo-50 hover:via-slate-50/50 dark:hover:from-indigo-500/[0.12] dark:hover:via-slate-900/60 transition-colors duration-200"
        aria-expanded={open}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500 dark:from-indigo-400 dark:via-indigo-400 dark:to-violet-400 opacity-90"
        />
        <span className="text-indigo-500/80 dark:text-indigo-300/80 transition-transform duration-200 group-hover:translate-x-0.5">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          {range}
        </span>
        {code && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide tabular-nums text-indigo-700 dark:text-indigo-200 bg-indigo-100/70 dark:bg-indigo-400/10 ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-300/20">
            {code}
          </span>
        )}
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
                      'px-4 py-3 text-left text-[13px] font-semibold text-foreground/70' +
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
                <tr><td colSpan={COLS.length} className="px-5 py-6 text-center text-sm text-muted-foreground">No items yet.</td></tr>
              ) : items.map((f) => (
                <FollowUpRow
                  key={f.id}
                  f={f}
                  weekOptions={weekOptions}
                  onDelete={onDelete}
                  onEditField={onEditField}
                  onMoveWeek={onMoveWeek}
                />
              ))}
            </tbody>
          </table>
          <AddRowInline weekLabel={label} onAdd={onAdd} />
        </div>
      )}
    </Card>
  )
}
