import { Trash2 } from 'lucide-react'
import { TR, TD } from '@/components/ui/table'
import { InlineText } from '@/components/ui/inline-text'
import { KindDropdown } from './KindDropdown'
import { SignalStatusDropdown } from './SignalStatusDropdown'
import { cn } from '@/lib/utils'

export function SignalRow({ s, onDelete, onEditField, themeSuggestions }) {
  const isDismissed = s.status === 'dismissed'
  return (
    <TR className={cn('transition-colors duration-[180ms]', isDismissed && 'opacity-60')}>
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={s.observation}
          onCommit={(v) => onEditField(s.id, 'observation', v)}
          placeholder="What did you notice? A question or observation…"
          textClassName={cn('text-sm font-medium leading-snug', isDismissed && 'line-through')}
          multiline
        />
      </TD>
      <TD className="align-top py-3 border-r border-border/60 text-center">
        <KindDropdown value={s.kind} onChange={(v) => onEditField(s.id, 'kind', v)} />
      </TD>
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={s.theme}
          onCommit={(v) => onEditField(s.id, 'theme', v)}
          placeholder="Theme…"
          textClassName="text-sm text-foreground/80"
          multiline={false}
        />
      </TD>
      <TD className="align-top py-3 border-r border-border/60 text-center">
        <SignalStatusDropdown status={s.status} onChange={(v) => onEditField(s.id, 'status', v)} />
      </TD>
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={s.note}
          onCommit={(v) => onEditField(s.id, 'note', v)}
          placeholder="Notes, context, evidence…"
          textClassName="text-sm text-foreground/80"
          multiline
        />
      </TD>
      <TD className="align-top py-2 border-r border-border/60">
        <InlineText
          value={s.source}
          onCommit={(v) => onEditField(s.id, 'source', v)}
          placeholder="Meeting / source"
          textClassName="text-sm text-muted-foreground"
          multiline={false}
        />
      </TD>
      <TD className="align-top py-3 text-right">
        <button
          onClick={() => onDelete(s.id)}
          className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Delete signal"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </TD>
    </TR>
  )
}
