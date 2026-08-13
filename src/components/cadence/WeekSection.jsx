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

export function WeekSection({
  label, items, weekOptions,
  onDelete, onEditField, onMoveWeek, onAdd,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const openCount = items.filter((i) => i.status !== 'done').length

  return (
    <Card className="overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-800/60 border-b border-border px-4 md:px-5 py-2.5 text-left hover:from-slate-50 hover:to-slate-200/70 dark:hover:from-slate-900 dark:hover:to-slate-800/80 transition-colors duration-200"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} className="text-foreground/60" /> : <ChevronRight size={14} className="text-foreground/60" />}
        <span className="text-sm font-semibold tracking-tight text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground ml-1.5">
          {items.length} · <span className="text-foreground/70">{openCount} open</span>
        </span>
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
