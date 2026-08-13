import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { TR, TD } from '@/components/ui/table'
import { StatusPill } from './StatusPill'

export function FollowUpRow({ f, onCycle, onDelete, onEditNote }) {
  const [note, setNote] = useState(f.statusNote || '')
  const commit = () => {
    if (note !== (f.statusNote || '')) onEditNote(f.id, note)
  }
  return (
    <TR>
      <TD className="align-top py-3 min-w-[280px]">
        <div className="text-sm font-medium leading-snug">{f.item}</div>
      </TD>
      <TD className="align-top py-3 w-[140px] text-sm text-foreground/80">{f.owner || <span className="text-muted-foreground">—</span>}</TD>
      <TD className="align-top py-3 min-w-[220px]">
        <div className="flex items-start gap-2">
          <StatusPill status={f.status} onCycle={() => onCycle(f.id)} />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Add a note…"
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 border-transparent hover:border-input focus:border-input rounded-md px-2 py-1 border"
          />
        </div>
      </TD>
      <TD className="align-top py-3 w-[44px] text-right">
        <button onClick={() => onDelete(f.id)} className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200" aria-label="Delete">
          <Trash2 size={13} />
        </button>
      </TD>
    </TR>
  )
}
