import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SeverityBadge } from './SeverityBadge'

export function BlockerCard({ b, onResolve }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-tight">{b.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Owner · {b.owner} · since {b.since}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge value={b.severity} />
          <button onClick={() => onResolve(b.id)} className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200" aria-label="Resolve">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3 text-sm text-foreground/80">{b.impact}</div>
    </Card>
  )
}
