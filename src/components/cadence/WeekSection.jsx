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
  const openCount = items.filter((i) => i.status !== 'done').length
  const blockerCount = items.filter((i) => i.status === 'blocker').length
  const { code, range } = parseLabel(label)

  return (
    <Card className="overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 border-b border-border px-4 md:px-5 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors duration-200"
        aria-expanded={open}
      >
        <div className="text-muted-foreground/70">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold tracking-tight text-foreground leading-tight">{range}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
            {code && <span className="font-medium text-foreground/70">{code}</span>}
            {code && <span className="mx-1.5">·</span>}
            <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            <span className="mx-1.5">·</span>
            <span>{openCount} open</span>
            {blockerCount > 0 && (
              <>
                <span className="mx-1.5">·</span>
                <span className="text-red-700 font-medium">{blockerCount} blocker{blockerCount === 1 ? '' : 's'}</span>
              </>
            )}
          </div>
        </div>
      </button>

      {open && (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>{COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
            <thead className="bg-muted/30">
              <tr>
                {COLS.map((c, i) => (
                  <th
                    key={c.key}
                    className={
                      'px-4 py-2.5 text-left text-[12px] font-medium text-muted-foreground' +
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
