import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SummaryCard({ label, value, delta, icon: Icon, tone = 'neutral' }) {
  const deltaClass =
    tone === 'positive' ? 'text-green-700' : tone === 'negative' ? 'text-red-700' : 'text-muted-foreground'
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
        {Icon && <Icon size={18} className="text-muted-foreground" />}
      </div>
      <div className="mt-3 text-[28px] font-bold tracking-[-0.02em] leading-none">{value}</div>
      {delta && <div className={cn('mt-2 text-xs font-medium', deltaClass)}>{delta}</div>}
    </Card>
  )
}
