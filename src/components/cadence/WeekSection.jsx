import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FollowUpRow } from './FollowUpRow'
import { AddRowInline } from './AddRowInline'

const COLS = [
  { key: 'item',    width: '46%' },
  { key: 'owner',   width: '13%' },
  { key: 'status',  width: '10%' },
  { key: 'remarks', width: '24%' },
  { key: 'actions', width: '7%' },
]

function parseLabel(label) {
  const m = label.match(/^(W\d+)\s*[:.\-]?\s*(.+)$/)
  return m ? { code: m[1], range: m[2] } : { code: '', range: label }
}

export function WeekSection({
  label, items, weekOptions,
  onCycle, onDelete, onEditField, onMoveWeek, onRollOpen, onAdd,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const openCount = items.filter((i) => i.status !== 'done').length
  const canRoll = onRollOpen && openCount > 0
  const { code, range } = parseLabel(label)
  const bodyId = `week-body-${label.replace(/\W+/g, '-')}`
  const titleId = `week-title-${label.replace(/\W+/g, '-')}`

  return (
    <section aria-labelledby={titleId} className="border-t border-border">
      <header className="flex items-baseline justify-between gap-4 py-5">
        <div className="flex items-baseline gap-4 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={bodyId}
            className="group inline-flex items-baseline gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
          >
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={cn(
                'text-muted-foreground group-hover:text-foreground transition-transform duration-200 relative top-0.5',
                !open && '-rotate-90'
              )}
              aria-hidden="true"
            />
            <h2 id={titleId} className="text-[22px] font-semibold tracking-[-0.02em]">
              {code && <span className="text-muted-foreground/70 mr-2 font-medium">{code}</span>}
              <span>{range}</span>
            </h2>
          </button>
          <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {items.length} · {openCount} open
          </span>
        </div>
        {canRoll && (
          <button
            type="button"
            onClick={() => onRollOpen(label)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
          >
            Roll open → next week
          </button>
        )}
      </header>

      {open && (
        <div id={bodyId}>
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>{COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="px-4 py-6 text-sm text-muted-foreground">
                    Nothing yet.
                  </td>
                </tr>
              ) : items.map((f) => (
                <FollowUpRow
                  key={f.id}
                  f={f}
                  weekOptions={weekOptions}
                  onCycle={onCycle}
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
    </section>
  )
}
