import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { WeekSection } from '@/components/cadence/WeekSection'
import { toast } from '@/components/ui/toaster'
import { weekLabelFromDate, suggestedWeekOptions } from '@/lib/week'
import { listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp } from '@/lib/api'

const UNSCHEDULED = 'Unscheduled'
const FIELD_TO_DB = { item: 'item', owner: 'owner', statusNote: 'status_note', kind: 'kind', status: 'status' }

function groupByWeek(items, filter) {
  const q = filter.trim().toLowerCase()
  const filtered = q
    ? items.filter((f) => [f.item, f.owner, f.statusNote].some((v) => (v || '').toLowerCase().includes(q)))
    : items
  const map = new Map()
  for (const f of filtered) {
    const key = f.weekLabel || UNSCHEDULED
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  for (const [, list] of map) {
    list.sort((a, b) => (a.status === 'blocker' ? 1 : 0) - (b.status === 'blocker' ? 1 : 0))
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
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const currentWeek = weekLabelFromDate()

  const load = async () => {
    setStatus('loading'); setError(null)
    try { setFollowUps(await listFollowUps()); setStatus('ready') }
    catch (e) { setError(e.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const groups = useMemo(() => {
    const map = groupByWeek(followUps, query)
    const keys = new Set(map.keys())
    if (!query) keys.add(currentWeek)
    const ordered = orderWeeks([...keys])
    return ordered.map((label) => ({ label, items: map.get(label) || [] }))
  }, [followUps, currentWeek, query])

  const weekOptions = useMemo(() => {
    const set = new Set([...suggestedWeekOptions(), ...followUps.map((f) => f.weekLabel).filter(Boolean)])
    return orderWeeks([...set])
  }, [followUps])

  const removeFollowUp = async (id) => {
    const snapshot = followUps.find((r) => r.id === id)
    if (!snapshot) return
    setFollowUps((rs) => rs.filter((r) => r.id !== id))
    let undone = false
    toast({
      message: `Deleted "${(snapshot.item || 'item').slice(0, 40)}"`,
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          undone = true
          setFollowUps((rs) => [snapshot, ...rs])
        },
      },
    })
    setTimeout(async () => {
      if (!undone) await deleteFollowUp(id).catch((e) => setError(e.message))
    }, 5000)
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
    toast({ message: `Moved to ${weekLabel}`, duration: 2200 })
  }

  if (status === 'loading') {
    return (<><PageHeader title="Weekly Alignment Huddle" /><Card><LoadingBlock label="Loading…" /></Card></>)
  }
  if (status === 'error') {
    return (<><PageHeader title="Weekly Alignment Huddle" /><Card><ErrorState message={error} onRetry={load} /></Card></>)
  }

  const hasQuery = query.trim().length > 0
  return (
    <>
      <PageHeader
        title="Weekly Alignment Huddle"
        actions={
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this huddle…"
              className="pl-9 pr-14 h-9"
              aria-label="Search follow-ups and blockers"
            />
            <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-medium text-muted-foreground border border-border bg-muted/40 absolute right-2 top-1/2 -translate-y-1/2 tabular-nums">
              ⌘K
            </kbd>
          </div>
        }
      />

      {followUps.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="Nothing scheduled yet"
            description="Open a week and add your first follow-up or blocker to kick off the huddle."
          />
        </Card>
      ) : hasQuery && groups.every((g) => g.items.length === 0) ? (
        <Card><EmptyState icon={Search} title="No matches" description={`Nothing matches "${query}".`} /></Card>
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
          />
        ))
      )}
    </>
  )
}
