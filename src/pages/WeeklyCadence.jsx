import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ListChecks } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { AddFollowUpForm } from '@/components/cadence/AddFollowUpForm'
import { FollowUpRow } from '@/components/cadence/FollowUpRow'
import { BlockerCard } from '@/components/cadence/BlockerCard'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import {
  listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp,
  listBlockers, deleteBlocker,
} from '@/lib/api'

const NEXT = { open: 'in_progress', in_progress: 'done', done: 'open' }

export default function WeeklyCadence() {
  const [followUps, setFollowUps] = useState([])
  const [blockers, setBlockers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = async () => {
    setStatus('loading'); setError(null)
    try {
      const [f, b] = await Promise.all([listFollowUps(), listBlockers()])
      setFollowUps(f); setBlockers(b); setStatus('ready')
    } catch (e) { setError(e.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  const cycleStatus = async (id) => {
    const cur = followUps.find((r) => r.id === id)
    if (!cur) return
    const next = NEXT[cur.status] || 'open'
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)))
    await updateFollowUp(id, { status: next }).catch((e) => setError(e.message))
  }
  const removeFollowUp = async (id) => {
    setFollowUps((rs) => rs.filter((r) => r.id !== id))
    await deleteFollowUp(id).catch((e) => setError(e.message))
  }
  const addFollowUp = async (item) => {
    const created = await insertFollowUp(item).catch((e) => { setError(e.message); return null })
    if (created) setFollowUps((rs) => [created, ...rs])
  }
  const resolveBlocker = async (id) => {
    setBlockers((bs) => bs.filter((b) => b.id !== id))
    await deleteBlocker(id).catch((e) => setError(e.message))
  }

  const open = followUps.filter((f) => f.status !== 'done').length
  const done = followUps.length - open

  if (status === 'loading') {
    return (
      <>
        <PageHeader title="Weekly Cadence" description="Follow-ups and blockers, owned and dated." />
        <Card><LoadingBlock label="Loading cadence…" /></Card>
      </>
    )
  }
  if (status === 'error') {
    return (
      <>
        <PageHeader title="Weekly Cadence" description="Follow-ups and blockers, owned and dated." />
        <Card><ErrorState message={error} onRetry={load} /></Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Weekly Cadence" description="Follow-ups and blockers, owned and dated." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Open follow-ups" value={open} delta={`${done} closed`} icon={ListChecks} tone="neutral" />
        <SummaryCard
          label="Blockers"
          value={blockers.length}
          delta={blockers.some((b) => b.severity === 'critical' || b.severity === 'high') ? 'Attention needed' : 'Under control'}
          icon={AlertTriangle}
          tone={blockers.length ? 'neutral' : 'positive'}
        />
        <SummaryCard label="Closed" value={done} delta="synced live" icon={CheckCircle2} tone="positive" />
      </div>

      <div className="mb-4"><AddFollowUpForm onAdd={addFollowUp} /></div>

      <Card className="overflow-hidden mb-8">
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
          <CardDescription>Click a status to advance it. Delete when no longer relevant.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {followUps.length === 0 ? (
            <EmptyState icon={ListChecks} title="Nothing to follow up on" description="Add a follow-up when a decision, sign-off, or check-in is pending." />
          ) : (
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Item</TH><TH>Owner</TH><TH>Due</TH><TH>Severity</TH><TH>Status</TH><TH></TH>
                </TR>
              </THead>
              <TBody>
                {followUps.map((f) => (
                  <FollowUpRow key={f.id} f={f} onCycle={cycleStatus} onDelete={removeFollowUp} />
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
        <Card><EmptyState icon={CheckCircle2} title="No active blockers" description="Squads are unblocked." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blockers.map((b) => <BlockerCard key={b.id} b={b} onResolve={resolveBlocker} />)}
        </div>
      )}
    </>
  )
}
