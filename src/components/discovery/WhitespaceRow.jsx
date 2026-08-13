import { TR, TD } from '@/components/ui/table'

function Meter({ value, tone }) {
  const bar = tone === 'accent' ? 'bg-foreground' : 'bg-muted-foreground/60'
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">{value}</div>
    </div>
  )
}

export function WhitespaceRow({ row }) {
  return (
    <TR>
      <TD className="font-medium min-w-[180px]">{row.segment}</TD>
      <TD className="min-w-[180px]"><Meter value={row.ourStrength} tone="accent" /></TD>
      <TD className="min-w-[180px]"><Meter value={row.marketCoverage} /></TD>
      <TD className="text-sm text-muted-foreground">{row.note}</TD>
    </TR>
  )
}
