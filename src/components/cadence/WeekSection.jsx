import { useState } from 'react'
import { ChevronDown, ChevronRight, ArrowRightCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { FollowUpRow } from './FollowUpRow'

export function WeekSection({
  label, items, weekOptions,
  onCycle, onDelete, onEditNote, onMoveWeek, onRollOpen,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const openCount = items.filter((i) => i.status !== 'done').length
  const canRoll = onRollOpen && openCount > 0

  return (
    <Card className="overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border-b border-border px-4 md:px-5 py-2.5 text-left hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 transition-colors duration-200"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} className="text-foreground/60" /> : <ChevronRight size={14} className="text-foreground/60" />}
        <span className="text-sm font-semibold tracking-tight text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground ml-1.5">
          {items.length} · <span className="text-foreground/70">{openCount} open</span>
        </span>
        {canRoll && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onRollOpen(label) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onRollOpen(label) } }}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground rounded-md px-2 py-1 hover:bg-white/60 dark:hover:bg-white/10 transition-colors duration-200"
            title="Move all open items to next week"
          >
            <ArrowRightCircle size={13} /> Roll open → next week
          </span>
        )}
      </button>

      {open && (
        items.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">No priorities logged for this week yet.</div>
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Top Priorities / Follow Up</TH>
                <TH>Owner</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {items.map((f) => (
                <FollowUpRow
                  key={f.id}
                  f={f}
                  weekOptions={weekOptions}
                  onCycle={onCycle}
                  onDelete={onDelete}
                  onEditNote={onEditNote}
                  onMoveWeek={onMoveWeek}
                />
              ))}
            </TBody>
          </Table>
        )
      )}
    </Card>
  )
}
