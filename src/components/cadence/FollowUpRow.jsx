import { Trash2 } from 'lucide-react'
import { TR, TD } from '@/components/ui/table'
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
      title="Toggle priority / blocker"
      className={cn(
        'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200',
        isBlocker
          ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
      )}
    >
      {isBlocker ? 'Blocker' : 'Priority'}
    </button>
  )
}

export function FollowUpRow({ f, weekOptions, onCycle, onDelete, onEditField, onMoveWeek }) {
  const isBlocker = f.kind === 'blocker'
  return (
    <TR className={cn(isBlocker && 'bg-red-50/30 dark:bg-red-950/10')}>
      <TD className={cn('align-middle py-2', isBlocker && 'border-l-2 border-l-red-400 dark:border-l-red-700')}>
        <div className="flex items-center gap-2">
          <KindTag kind={f.kind} onToggle={() => onEditField(f.id, 'kind', isBlocker ? 'priority' : 'blocker')} />
          <div className="flex-1 min-w-0">
            <InlineText
              value={f.item}
              onCommit={(v) => onEditField(f.id, 'item', v)}
              placeholder={isBlocker ? 'What is blocked…' : 'Describe the priority…'}
              textClassName="text-sm font-medium leading-snug"
            />
          </div>
        </div>
      </TD>
      <TD className="align-middle py-2">
        <InlineText
          value={f.owner}
          onCommit={(v) => onEditField(f.id, 'owner', v)}
          placeholder="Owner"
          textClassName="text-sm text-foreground/80"
        />
      </TD>
      <TD className="align-middle py-2">
        <div className="flex items-center gap-2">
          <StatusPill status={f.status} onCycle={() => onCycle(f.id)} />
          <div className="flex-1 min-w-0">
            <InlineText
              value={f.statusNote}
              onCommit={(v) => onEditField(f.id, 'statusNote', v)}
              placeholder={isBlocker ? 'Why it\'s blocking…' : 'Add a note…'}
              textClassName="text-sm text-foreground/80"
            />
          </div>
        </div>
      </TD>
      <TD className="align-middle py-2 text-right">
        <div className="flex items-center justify-end gap-0.5">
          <MoveMenu current={f.weekLabel} options={weekOptions} onSelect={(w) => onMoveWeek(f.id, w)} />
          <button
            onClick={() => onDelete(f.id)}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </TD>
    </TR>
  )
}
