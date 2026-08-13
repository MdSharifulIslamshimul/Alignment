import { Trash2 } from 'lucide-react'
import { TR, TD } from '@/components/ui/table'
import { SeverityBadge } from './SeverityBadge'
import { StatusPill } from './StatusPill'

export function FollowUpRow({ f, onCycle, onDelete }) {
  return (
    <TR>
      <TD className="min-w-[220px]">
        <div className="font-medium">{f.item}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{f.context}</div>
      </TD>
      <TD className="min-w-[120px] text-muted-foreground">{f.owner}</TD>
      <TD className="min-w-[110px] tabular-nums text-muted-foreground">{f.due}</TD>
      <TD className="min-w-[110px]"><SeverityBadge value={f.severity} /></TD>
      <TD className="min-w-[120px]"><StatusPill status={f.status} onCycle={() => onCycle(f.id)} /></TD>
      <TD className="w-[60px] text-right">
        <button onClick={() => onDelete(f.id)} className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200" aria-label="Delete">
          <Trash2 size={14} />
        </button>
      </TD>
    </TR>
  )
}
