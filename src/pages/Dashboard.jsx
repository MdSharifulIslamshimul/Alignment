import { useEffect, useState } from 'react'
import { LineChart, Compass, CalendarClock, TrendingUp, Target, Users, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { EntryCard } from '@/components/dashboard/EntryCard'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trend } from '@/lib/mockData'
import { listMetrics, listFollowUps, listBlockers } from '@/lib/api'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize text-muted-foreground">{p.dataKey}</span>
          <span className="ml-auto font-semibold tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ metrics: 0, onTrack: 0, followUps: 0, blockers: 0, blockersHigh: 0 })

  useEffect(() => {
    (async () => {
      const [m, f, b] = await Promise.all([listMetrics(), listFollowUps(), listBlockers()]).catch(() => [[], [], []])
      const onTrack = (m || []).filter((r) => r.achieved === 'On track' || r.achieved === 'Achieved').length
      const blockersHigh = (b || []).filter((x) => x.severity === 'critical' || x.severity === 'high').length
      setStats({ metrics: (m || []).length, onTrack, followUps: (f || []).filter((r) => r.status !== 'done').length, blockers: (b || []).length, blockersHigh })
    })()
  }, [])

  return (
    <>
      <PageHeader
        title="Command Center"
        description="A single view across objectives, discovery signals, and weekly execution."
        actions={<Button variant="secondary" size="sm">This week</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="On track" value={`${stats.onTrack} / ${stats.metrics || '—'}`} delta="live from Supabase" tone="positive" icon={Target} />
        <SummaryCard label="Activation (W1)" value="45%" delta="+2.0 pts" tone="positive" icon={TrendingUp} />
        <SummaryCard label="Open blockers" value={stats.blockers} delta={stats.blockersHigh ? `${stats.blockersHigh} needs attention` : 'Under control'} tone={stats.blockersHigh ? 'neutral' : 'positive'} icon={AlertTriangle} />
        <SummaryCard label="Open follow-ups" value={stats.followUps} delta="across all squads" tone="neutral" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[18px]">Operating trend</CardTitle>
            <CardDescription>Activation and retention — trailing 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#111827" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="activation" stroke="#111827" strokeWidth={2} fill="url(#g1)" />
                  <Area type="monotone" dataKey="retention" stroke="#6b7280" strokeWidth={1.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">This week</CardTitle>
            <CardDescription>Top of mind for the leadership team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { t: 'Ship activation experiment', d: 'Growth · due Fri' },
              { t: 'Finalize pricing v3 comms', d: 'Monetization · due Mon' },
              { t: 'Retention scope review', d: 'Retention · due today' },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                <div>
                  <div className="text-sm font-medium">{x.t}</div>
                  <div className="text-xs text-muted-foreground">{x.d}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 text-[18px] font-semibold tracking-tight">Jump in</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EntryCard to="/metrics" title="Operating Metrics Review" description="Objectives, initiatives, and success metrics across every wing." icon={LineChart} meta={`${stats.metrics} initiatives · live`} />
        <EntryCard to="/discovery" title="Discovery" description="Whitespace, positioning, and product & competitive signals." icon={Compass} meta="4 competitor updates this week" />
        <EntryCard to="/cadence" title="Weekly Cadence" description="Follow-ups and blockers, owned and dated." icon={CalendarClock} meta={`${stats.followUps} follow-ups · ${stats.blockers} blockers`} />
      </div>
    </>
  )
}
