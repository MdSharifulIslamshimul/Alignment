import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { AddFollowUpForm } from '@/components/cadence/AddFollowUpForm'
import { WeekSection } from '@/components/cadence/WeekSection'
import { ParkingLot } from '@/components/cadence/ParkingLot'
import { CalendarClock } from 'lucide-react'
import { weekLabelFromDate } from '@/lib/week'
import {
  listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp,
  listBlockers, insertBlocker, deleteBlocker,
} from '@/lib/api'

const NEXT_STATUS = { open: 'in_progress', in_progress: 'done', done: 'open' }
const UNSCHEDULED = 'Unscheduled'

function groupByWeek(items) {
  const map = new Map()
  for (const f of items) {
    const key = f.weekLabel || UNSCHEDULED
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  return map
}

function orderWeeks(keys, currentLabel) {
  const parseWeek = (label) => {
    const m = label.match(/^W(\d+)/)
    return m ? parseInt(m[1], 10) : -1
  }
  return keys.sort((a, b) => {
    if (a === UNSCHEDULED) return 1
    if (b === UNSCHEDULED) return -1
    if (a === currentLabel) return -1
    if (b === currentLabel) return 1
    return parseWeek(a) - parseWeek(b)
  })
}

export default function WeeklyCadence() {
  const [followUps, setFollowUps] = useState([])
  const [blockers, setBlockers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const currentWeek = weekLabelFromDate()

  const load = async () => {
    setStatus('loading'); setError(null)
    try {
      const [f, b] = await Promise.all([listFollowUps(), listBlockers()])
      setFollowUps(f); setBlockers(b); setStatus('ready')
    } catch (e) { setError(e.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  const grouped = useMemo(() => {
    const map = groupByWeek(followUps)
    const ordered = orderWeeks([...map.keys()], currentWeek)
    if (!ordered.includes(currentWeek)) ordered.unshift(currentWeek)
    return ordered.map((label) => ({ label, items: map.get(label) || [] }))
  }, [followUps, currentWeek])

  const cycleStatus = async (id) => {
    const cur = followUps.find((r) => r.id === id)
    if (!cur) return
    const next = NEXT_STATUS[cur.status] || 'open'
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)))
    await updateFollowUp(id, { status: next }).catch((e) => setError(e.message))
  }
  const removeFollowUp = async (id) => {
    setFollowUps((rs) => rs.filter((r) => r.id !== id))
    await deleteFollowUp(id).catch((e) => setError(e.message))
  }
  const editNote = async (id, statusNote) => {
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, statusNote } : r)))
    await updateFollowUp(id, { status_note: statusNote }).catch((e) => setError(e.message))
  }
  const addFollowUp = async (item) => {
    const created = await insertFollowUp(item).catch((e) => { setError(e.message); return null })
    if (created) setFollowUps((rs) => [created, ...rs])
  }
  const resolveBlocker = async (id) => {
    setBlockers((bs) => bs.filter((b) => b.id !== id))
    await deleteBlocker(id).catch((e) => setError(e.message))
  }
  const addBlocker = async (b) => {
    const created = await insertBlocker(b).catch((e) => { setError(e.message); return null })
    if (created) setBlockers((bs) => [created, ...bs])
  }

  if (status === 'loading') {
    return (
      <>
        <PageHeader title="Weekly Alignment Huddle" description="Top priorities, owners, and status — grouped by week." />
        <Card><LoadingBlock label="Loading huddle…" /></Card>
      </>
    )
  }
  if (status === 'error') {
    return (
      <>
        <PageHeader title="Weekly Alignment Huddle" description="Top priorities, owners, and status — grouped by week." />
        <Card><ErrorState message={error} onRetry={load} /></Card>
      </>
    )
  }

  const allEmpty = followUps.length === 0
  return (
    <>
      <PageHeader
        title="Weekly Alignment Huddle"
        description="Top priorities, owners, and status — grouped by week."
      />

      <div className="mb-4"><AddFollowUpForm onAdd={addFollowUp} defaultWeek={currentWeek} /></div>

      {allEmpty ? (
        <Card className="mb-6">
          <EmptyState
            icon={CalendarClock}
            title="No priorities yet"
            description="Add the first priority for this week to kick off the huddle."
          />
        </Card>
      ) : (
        grouped.map(({ label, items }) => (
          <WeekSection
            key={label}
            label={label}
            items={items}
            onCycle={cycleStatus}
            onDelete={removeFollowUp}
            onEditNote={editNote}
          />
        ))
      )}

      <ParkingLot items={blockers} onAdd={addBlocker} onResolve={resolveBlocker} />
    </>
  )
}
