import { useEffect, useMemo, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { WeekSection } from '@/components/cadence/WeekSection'
import { weekLabelFromDate, nextLabelAfter, suggestedWeekOptions } from '@/lib/week'
import { listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp } from '@/lib/api'

const UNSCHEDULED = 'Unscheduled'
const FIELD_TO_DB = { item: 'item', owner: 'owner', statusNote: 'status_note', kind: 'kind', status: 'status' }

function groupByWeek(items) {
  const map = new Map()
  for (const f of items) {
    const key = f.weekLabel || UNSCHEDULED
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  // Follow-ups first, blockers last inside a week
  for (const [, list] of map) {
    list.sort((a, b) => (a.kind === 'blocker' ? 1 : 0) - (b.kind === 'blocker' ? 1 : 0))
  }
  return map
}

function orderWeeks(keys) {
  const parseWeek = (l) => { const m = l.match(/^W(\d+)/); return m ? parseInt(m[1], 10) : -1 }
  return keys.sort((a, b) => {
    if (a === UNSCHEDULED) return 1
    if (b === UNSCHEDULED) return -1
    return parseWeek(b) - parseWeek(a)
  })
}

export default function WeeklyCadence() {
  const [followUps, setFollowUps] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const currentWeek = weekLabelFromDate()

  const load = async () => {
    setStatus('loading'); setError(null)
    try {
      const f = await listFollowUps()
      setFollowUps(f); setStatus('ready')
    } catch (e) { setError(e.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  const groups = useMemo(() => {
    const map = groupByWeek(followUps)
    const keys = new Set(map.keys())
    keys.add(currentWeek)
    const ordered = orderWeeks([...keys])
    return ordered.map((label) => ({ label, items: map.get(label) || [] }))
  }, [followUps, currentWeek])

  const weekOptions = useMemo(() => {
    const set = new Set([...suggestedWeekOptions(), ...followUps.map((f) => f.weekLabel).filter(Boolean)])
    return orderWeeks([...set])
  }, [followUps])

  const removeFollowUp = async (id) => {
    setFollowUps((rs) => rs.filter((r) => r.id !== id))
    await deleteFollowUp(id).catch((e) => setError(e.message))
  }
  const editField = async (id, field, value) => {
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    const dbKey = FIELD_TO_DB[field]
    if (!dbKey) return
    await updateFollowUp(id, { [dbKey]: value }).catch((e) => setError(e.message))
  }
  const addFollowUp = async (item) => {
    const created = await insertFollowUp(item).catch((e) => { setError(e.message); return null })
    if (created) setFollowUps((rs) => [created, ...rs])
  }
  const moveWeek = async (id, weekLabel) => {
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, weekLabel } : r)))
    await updateFollowUp(id, { week_label: weekLabel }).catch((e) => setError(e.message))
  }
  const rollOpenToNext = async (fromLabel) => {
    const target = nextLabelAfter(fromLabel) || weekLabelFromDate()
    const moving = followUps.filter((f) => f.weekLabel === fromLabel && f.status !== 'done' && f.status !== 'stuck')
    if (moving.length === 0) return
    setFollowUps((rs) => rs.map((r) => (moving.find((m) => m.id === r.id) ? { ...r, weekLabel: target } : r)))
    for (const m of moving) {
      await updateFollowUp(m.id, { week_label: target }).catch((e) => setError(e.message))
    }
  }

  if (status === 'loading') {
    return (
      <>
        <PageHeader title="Weekly Alignment Huddle" description="Follow-ups and blockers, per week." />
        <Card><LoadingBlock label="Loading huddle…" /></Card>
      </>
    )
  }
  if (status === 'error') {
    return (
      <>
        <PageHeader title="Weekly Alignment Huddle" description="Follow-ups and blockers, per week." />
        <Card><ErrorState message={error} onRetry={load} /></Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Weekly Alignment Huddle"
        description="Follow-ups and blockers per week. Blockers sort to the bottom of each week; toggle a row's tag to switch types."
      />

      {followUps.length === 0 ? (
        <Card className="mb-6">
          <EmptyState
            icon={CalendarClock}
            title="No items yet"
            description="Add a follow-up or blocker with the + button inside a week."
          />
        </Card>
      ) : (
        groups.map(({ label, items }) => (
          <WeekSection
            key={label}
            label={label}
            items={items}
            weekOptions={weekOptions}
            defaultOpen={label === currentWeek || items.length > 0}
            onDelete={removeFollowUp}
            onEditField={editField}
            onMoveWeek={moveWeek}
            onAdd={addFollowUp}
            onRollOpen={label === UNSCHEDULED ? null : rollOpenToNext}
          />
        ))
      )}
    </>
  )
}
