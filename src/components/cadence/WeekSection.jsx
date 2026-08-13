import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { FollowUpRow } from './FollowUpRow'
import { AddRowInline } from './AddRowInline'

const COLS = [
  { key: 'item',    label: 'Follow Up / Blocker', width: '40%' },
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
  const { code, range } = parseLabel(label)

  return (
    <Card className="overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 bg-card border-b border-border px-5 py-4 text-left hover:bg-muted/30 transition-colors duration-200"
        aria-expanded={open}
      >
        <div className="min-w-0">
          {code && (
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{code}</div>
          )}
          <div className="text-[22px] font-bold tracking-[-0.02em] leading-none mt-1">{range}</div>
          <div className="text-xs text-muted-foreground mt-1.5 tabular-nums">
            {items.length} {items.length === 1 ? 'item' : 'items'} · {openCount} open
          </div>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-muted-foreground shrink-0 mt-1" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1" />
        )}
      </button>

      {open && (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}
            </colgroup>
            <thead className="bg-muted/40">
              <tr>
                {COLS.map((c) => (
                  <th key={c.key} className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</th>
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
