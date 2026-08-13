import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ListChecks } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { AddFollowUpForm } from '@/components/cadence/AddFollowUpForm'
import { FollowUpRow } from '@/components/cadence/FollowUpRow'
import { BlockerCard } from '@/components/cadence/BlockerCard'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { initialFollowUps, initialBlockers } from '@/lib/mockData'

const NEXT = { open: 'in_progress', in_progress: 'done', done: 'open' }

export default function WeeklyCadence() {
  const [followUps, setFollowUps] = useState(initialFollowUps)
  const [blockers, setBlockers] = useState(initialBlockers)

  const cycleStatus = (id) =>
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, status: NEXT[r.status] } : r)))
  const deleteFollowUp = (id) => setFollowUps((rs) => rs.filter((r) => r.id !== id))
  const addFollowUp = (item) => setFollowUps((rs) => [item, ...rs])
  const resolveBlocker = (id) => setBlockers((bs) => bs.filter((b) => b.id !== id))

  const open = followUps.filter((f) => f.status !== 'done').length
  const done = followUps.length - open

  return (
    <>
      <PageHeader
        title="Weekly Cadence"
        description="Follow-ups and blockers, owned and dated."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Open follow-ups" value={open} delta={`${done} closed this week`} icon={ListChecks} tone="neutral" />
        <SummaryCard label="Blockers" value={blockers.length} delta={blockers.some((b) => b.severity === 'critical' || b.severity === 'high') ? 'Attention needed' : 'Under control'} icon={AlertTriangle} tone={blockers.length ? 'neutral' : 'positive'} />
        <SummaryCard label="Closed this week" value={done} delta="+3 vs last week" icon={CheckCircle2} tone="positive" />
      </div>

      <div className="mb-4"><AddFollowUpForm onAdd={addFollowUp} /></div>

      <Card className="overflow-hidden mb-8">
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
          <CardDescription>Click a status to advance it. Delete when no longer relevant.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {followUps.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="Nothing to follow up on"
              description="Add a follow-up when a decision, sign-off, or check-in is pending."
            />
          ) : (
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Item</TH><TH>Owner</TH><TH>Due</TH><TH>Severity</TH><TH>Status</TH><TH></TH>
                </TR>
              </THead>
              <TBody>
                {followUps.map((f) => (
                  <FollowUpRow key={f.id} f={f} onCycle={cycleStatus} onDelete={deleteFollowUp} />
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-tight">Active blockers</h2>
        <div className="text-xs text-muted-foreground">{blockers.length} active</div>
      </div>
      {blockers.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="No active blockers"
            description="Squads are unblocked. Add a blocker if something is stopping delivery."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blockers.map((b) => <BlockerCard key={b.id} b={b} onResolve={resolveBlocker} />)}
        </div>
      )}
    </>
  )
}
