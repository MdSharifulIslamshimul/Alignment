import { Badge } from '@/components/ui/badge'

export function InsightItem({ i }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{i.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{i.evidence}</div>
      </div>
      <Badge tone={i.sentiment}>{i.sentiment}</Badge>
    </div>
  )
}
