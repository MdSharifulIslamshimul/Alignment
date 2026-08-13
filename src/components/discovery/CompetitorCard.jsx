import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CompetitorCard({ c }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">{c.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{c.positioning}</div>
        </div>
        <Badge tone={c.sentiment}>{c.sentiment}</Badge>
      </div>
      <div className="mt-4 text-sm text-foreground/80">{c.delta}</div>
    </Card>
  )
}
