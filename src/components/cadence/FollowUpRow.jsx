import { Trash2 } from 'lucide-react'
import { TR, TD } from '@/components/ui/table'
import { StatusDropdown } from './StatusDropdown'
import { MoveMenu } from './MoveMenu'
import { InlineText } from '@/components/ui/inline-text'
import { cn } from '@/lib/utils'

export function FollowUpRow({ f, weekOptions, onDelete, onEditField, onMoveWeek }) {
  const isBlocker = f.status === 'blocker'
  const isStuck = f.status === 'stuck'
  const isDone = f.status === 'done'
  return (
    <TR
      className={cn(
        'transition-colors duration-[180ms]',
        isDone && 'opacity-60'
      )}
    >
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={f.item}
          onCommit={(v) => onEditField(f.id, 'item', v)}
          placeholder={isBlocker ? 'What is blocked…' : 'Describe the priority…'}
          textClassName={cn('text-sm font-medium leading-snug', isDone && 'line-through')}
          multiline
        />
      </TD>
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={f.owner}
          onCommit={(v) => onEditField(f.id, 'owner', v)}
          placeholder="Owner"
          textClassName="text-sm text-foreground/80"
          multiline={false}
        />
      </TD>
      <TD className="align-top py-3 border-r border-border/60 text-center">
        <StatusDropdown status={f.status} onChange={(v) => onEditField(f.id, 'status', v)} />
      </TD>
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={f.statusNote}
          onCommit={(v) => onEditField(f.id, 'statusNote', v)}
          placeholder={isBlocker ? 'Why it\'s blocking…' : 'Add remarks…'}
          textClassName="text-sm text-foreground/80"
          multiline
        />
      </TD>
      <TD className="align-top py-3 text-right">
        <div className="flex items-center justify-end gap-0.5">
          <MoveMenu current={f.weekLabel} options={weekOptions} onSelect={(w) => onMoveWeek(f.id, w)} />
          <button
            onClick={() => onDelete(f.id)}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Delete row"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </TD>
    </TR>
  )
}
