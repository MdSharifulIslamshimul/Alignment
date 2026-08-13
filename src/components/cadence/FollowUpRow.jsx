import { Trash2 } from 'lucide-react'
import { StatusPill } from './StatusPill'
import { MoveMenu } from './MoveMenu'
import { InlineText } from './InlineText'
import { cn } from '@/lib/utils'

function KindTag({ kind, onToggle }) {
  const isBlocker = kind === 'blocker'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isBlocker ? 'Blocker — click to switch to follow-up' : 'Follow-up — click to switch to blocker'}
      title={isBlocker ? 'Blocker' : 'Follow up'}
      className={cn(
        'shrink-0 inline-flex items-center gap-1.5 rounded-full h-5 px-2 text-[10px] font-medium uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isBlocker
          ? 'text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
          : 'text-muted-foreground bg-muted hover:text-foreground'
      )}
    >
      {isBlocker && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400" />}
      {isBlocker ? 'Blocker' : 'Follow Up'}
    </button>
  )
}

export function FollowUpRow({ f, weekOptions, onCycle, onDelete, onEditField, onMoveWeek }) {
  return (
    <tr className="group border-t border-border/60 hover:bg-muted/30 transition-colors duration-200">
      <td className="align-middle py-2.5 px-4">
        <div className="flex items-center gap-2.5">
          <KindTag kind={f.kind} onToggle={() => onEditField(f.id, 'kind', f.kind === 'blocker' ? 'priority' : 'blocker')} />
          <div className="flex-1 min-w-0">
            <InlineText
              value={f.item}
              onCommit={(v) => onEditField(f.id, 'item', v)}
              placeholder={f.kind === 'blocker' ? 'What is blocked' : 'Follow-up'}
              textClassName="text-[14px] font-medium leading-snug"
            />
          </div>
        </div>
      </td>
      <td className="align-middle py-2.5 px-4">
        <InlineText
          value={f.owner}
          onCommit={(v) => onEditField(f.id, 'owner', v)}
          placeholder="Owner"
          textClassName="text-[13px] text-foreground/80"
        />
      </td>
      <td className="align-middle py-2.5 px-4">
        <StatusPill status={f.status} onCycle={() => onCycle(f.id)} />
      </td>
      <td className="align-middle py-2.5 px-4">
        <InlineText
          value={f.statusNote}
          onCommit={(v) => onEditField(f.id, 'statusNote', v)}
          placeholder="Remarks"
          textClassName="text-[13px] text-foreground/70"
        />
      </td>
      <td className="align-middle py-2.5 px-2 text-right">
        <div className="flex items-center justify-end gap-0.5 opacity-40 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
          <MoveMenu current={f.weekLabel} options={weekOptions} onSelect={(w) => onMoveWeek(f.id, w)} />
          <button
            onClick={() => onDelete(f.id)}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Delete ${f.item || 'item'}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}
