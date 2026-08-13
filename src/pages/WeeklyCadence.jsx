import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { WeekSection } from '@/components/cadence/WeekSection'
import { CalendarClock } from 'lucide-react'
import { weekLabelFromDate, nextLabelAfter, suggestedWeekOptions } from '@/lib/week'
import { listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp } from '@/lib/api'

const NEXT_STATUS = { open: 'in_progress', in_progress: 'done', done: 'open' }
const UNSCHEDULED = 'Unscheduled'
const FIELD_TO_DB = { item: 'item', owner: 'owner', statusNote: 'status_note', kind: 'kind' }

function groupByWeek(items) {
  const map = new Map()
  for (const f of items) {
    const key = f.weekLabel || UNSCHEDULED
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.kind === 'blocker' ? 1 : 0) - (b.kind === 'blocker' ? 1 : 0))
  }
  return map
}

function orderWeeks(keys, currentLabel) {
  const parseWeek = (l) => { const m = l.match(/^W(\d+)/); return m ? parseInt(m[1], 10) : -1 }
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
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const currentWeek = weekLabelFromDate()

  const load = async () => {
    setStatus('loading'); setError(null)
    try { setFollowUps(await listFollowUps()); setStatus('ready') }
    catch (e) { setError(e.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  const groups = useMemo(() => {
    const map = groupByWeek(followUps)
    const ordered = orderWeeks([...map.keys()], currentWeek)
    if (!ordered.includes(currentWeek)) ordered.unshift(currentWeek)
    return ordered.map((label) => ({ label, items: map.get(label) || [] }))
  }, [followUps, currentWeek])

  const weekOptions = useMemo(() => {
    const set = new Set([...suggestedWeekOptions(), ...followUps.map((f) => f.weekLabel).filter(Boolean)])
    return orderWeeks([...set], currentWeek)
  }, [followUps, currentWeek])

  const cycleStatus = async (id) => {
    const cur = followUps.find((r) => r.id === id); if (!cur) return
    const next = NEXT_STATUS[cur.status] || 'open'
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)))
    await updateFollowUp(id, { status: next }).catch((e) => setError(e.message))
  }
  const removeFollowUp = async (id) => {
    setFollowUps((rs) => rs.filter((r) => r.id !== id))
    await deleteFollowUp(id).catch((e) => setError(e.message))
  }
  const editField = async (id, field, value) => {
    setFollowUps((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    const dbKey = FIELD_TO_DB[field]; if (!dbKey) return
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
    const moving = followUps.filter((f) => f.weekLabel === fromLabel && f.status !== 'done')
    if (!moving.length) return
    setFollowUps((rs) => rs.map((r) => (moving.find((m) => m.id === r.id) ? { ...r, weekLabel: target } : r)))
    for (const m of moving) {
      await updateFollowUp(m.id, { week_label: target }).catch((e) => setError(e.message))
    }
  }

  if (status === 'loading') {
    return (<><PageHeader title="Weekly Alignment Huddle" /><LoadingBlock label="Loading…" /></>)
  }
  if (status === 'error') {
    return (<><PageHeader title="Weekly Alignment Huddle" /><ErrorState message={error} onRetry={load} /></>)
  }

  return (
    <>
      <PageHeader title="Weekly Alignment Huddle" />

      {followUps.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Nothing scheduled" description="Add your first follow-up under this week." />
      ) : (
        <div>
          {groups.map(({ label, items }) => (
            <WeekSection
              key={label}
              label={label}
              items={items}
              weekOptions={weekOptions}
              defaultOpen={label === currentWeek || items.length > 0}
              onCycle={cycleStatus}
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
              onRollOpen={label === UNSCHEDULED ? null : rollOpenToNext}
            />
          ))}
        </div>
      )}
    </>
  )
}
