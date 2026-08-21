import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { MonthSection } from '@/components/cadence/MonthSection'
import { QuarterlyScopeSection } from '@/components/cadence/QuarterlyScopeSection'
import { toast } from '@/components/ui/toaster'
import {
  weekLabelFromDate, suggestedWeekOptions,
  mondayFromLabelSmart, monthKeyFromDate, quarterKeyFromDate,
  formatMonthLabel, formatQuarterLabel,
  currentMonthKey, currentQuarterKey, mondayOf,
} from '@/lib/week'
import { listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp } from '@/lib/api'
import { statusRank } from '@/lib/statusOrder'

const FIELD_TO_DB = { item: 'item', owner: 'owner', statusNote: 'status_note', kind: 'kind', status: 'status' }

function filterItems(items, filter) {
  const q = filter.trim().toLowerCase()
  if (!q) return items
  return items.filter((f) => [f.item, f.owner, f.statusNote].some((v) => (v || '').toLowerCase().includes(q)))
}

function sortByWeekAndStatus(list, today) {
  return [...list].sort((a, b) => {
    const sa = statusRank(a.status)
    const sb = statusRank(b.status)
    if (sa !== sb) return sa - sb
    const ma = mondayFromLabelSmart(a.weekLabel, today)?.getTime() || 0
    const mb = mondayFromLabelSmart(b.weekLabel, today)?.getTime() || 0
    return mb - ma
  })
}

function buildMonthWeekOptions(itemWeeks, monthKey, today) {
  const set = new Set(itemWeeks)
  // Fill in every Monday-in-month between the earliest item and today (or the last item, whichever is later),
  // so the add-row picker can offer weeks that don't have items yet.
  const [y, m] = monthKey.split('-').map(Number)
  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = new Date(y, m, 0)   // last day of month
  let cursor = mondayOf(monthStart)
  while (cursor <= monthEnd) {
    if (cursor.getMonth() === m - 1) set.add(weekLabelFromDate(cursor))
    const next = new Date(cursor)
    next.setDate(next.getDate() + 7)
    cursor = next
  }
  return [...set].sort((a, b) => {
    const ma = mondayFromLabelSmart(a, today)?.getTime() || 0
    const mb = mondayFromLabelSmart(b, today)?.getTime() || 0
    return mb - ma
  })
}

function buildTiers(items, filter, today, currentLabel) {
  const filtered = filterItems(items, filter)
  const monthNow = currentMonthKey(today)
  const quarterNow = currentQuarterKey(today)

  // Bucket every filtered item by month.
  const monthBuckets = new Map()   // monthKey → { items: [], weeks: Set<label>, quarterKey }
  const unscheduled = []

  const bucketFor = (monthKey, quarterKey) => {
    if (!monthBuckets.has(monthKey)) {
      monthBuckets.set(monthKey, { items: [], weeks: new Set(), quarterKey })
    }
    return monthBuckets.get(monthKey)
  }

  for (const f of filtered) {
    if (!f.weekLabel) { unscheduled.push(f); continue }
    const monday = mondayFromLabelSmart(f.weekLabel, today)
    if (!monday) { unscheduled.push(f); continue }
    const mk = monthKeyFromDate(monday)
    const qk = quarterKeyFromDate(monday)
    const b = bucketFor(mk, qk)
    b.items.push(f)
    b.weeks.add(f.weekLabel)
  }

  // Ensure the live month always renders, even empty, so the user has a place to add.
  if (!filter && !monthBuckets.has(monthNow)) {
    bucketFor(monthNow, quarterNow)
  }
  // Ensure current week is offered in the picker when the live month has no items yet.
  if (monthBuckets.has(monthNow) && currentLabel) {
    monthBuckets.get(monthNow).weeks.add(currentLabel)
  }

  // Build tier-scoped view models.
  const currentWeekMonday = mondayFromLabelSmart(currentLabel, today)?.getTime() || 0
  let liveMonth = null
  const monthlyFolds = []
  const quarterBuckets = new Map() // quarterKey → Map<monthKey, entry>

  for (const [mKey, b] of monthBuckets.entries()) {
    const monthWeekOptions = buildMonthWeekOptions(b.weeks, mKey, today)
    const defaultAddWeek = monthWeekOptions.includes(currentLabel) ? currentLabel : monthWeekOptions[0]
    const entry = {
      key: mKey,
      label: formatMonthLabel(mKey),
      items: sortByWeekAndStatus(b.items, today),
      monthWeekOptions,
      defaultAddWeek,
    }

    if (mKey === monthNow) {
      liveMonth = entry
    } else if (b.quarterKey === quarterNow) {
      monthlyFolds.push(entry)
    } else {
      if (!quarterBuckets.has(b.quarterKey)) quarterBuckets.set(b.quarterKey, new Map())
      quarterBuckets.get(b.quarterKey).set(mKey, entry)
    }
  }

  monthlyFolds.sort((a, b) => (a.key < b.key ? 1 : -1))

  const quarterlyFolds = [...quarterBuckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([qKey, mMap]) => ({
      key: qKey,
      label: formatQuarterLabel(qKey),
      months: [...mMap.values()].sort((a, b) => (a.key < b.key ? 1 : -1)),
    }))

  return {
    liveMonth,
    monthlyFolds,
    quarterlyFolds,
    unscheduled: sortByWeekAndStatus(unscheduled, today),
    currentWeekMonday,
  }
}

export default function WeeklyCadence() {
  const [followUps, setFollowUps] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const today = useMemo(() => new Date(), [])
  const currentWeek = useMemo(() => weekLabelFromDate(today), [today])

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

  const tiers = useMemo(
    () => buildTiers(followUps, query, today, currentWeek),
    [followUps, currentWeek, query, today]
  )

  const weekOptions = useMemo(() => {
    const set = new Set([
      ...suggestedWeekOptions(),
      ...followUps.map((f) => f.weekLabel).filter(Boolean),
    ])
    return [...set].sort((a, b) => {
      const ma = mondayFromLabelSmart(a, today)
      const mb = mondayFromLabelSmart(b, today)
      return (mb?.getTime() || 0) - (ma?.getTime() || 0)
    })
  }, [followUps, today])

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
        onClick: () => { undone = true; setFollowUps((rs) => [snapshot, ...rs]) },
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
  const nothingVisible =
    hasQuery
    && (!tiers.liveMonth || tiers.liveMonth.items.length === 0)
    && tiers.monthlyFolds.length === 0
    && tiers.quarterlyFolds.length === 0
    && tiers.unscheduled.length === 0

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
            description="Add your first follow-up or blocker to kick off the huddle."
          />
        </Card>
      ) : nothingVisible ? (
        <Card><EmptyState icon={Search} title="No matches" description={`Nothing matches "${query}".`} /></Card>
      ) : (
        <>
          {tiers.liveMonth && (
            <MonthSection
              key={tiers.liveMonth.key}
              label={tiers.liveMonth.label}
              items={tiers.liveMonth.items}
              weekOptions={weekOptions}
              monthWeekOptions={tiers.liveMonth.monthWeekOptions}
              defaultAddWeek={tiers.liveMonth.defaultAddWeek}
              defaultOpen={true}
              forceOpen={hasQuery}
              variant="current"
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          )}

          {tiers.monthlyFolds.map((m) => (
            <MonthSection
              key={m.key}
              label={m.label}
              items={m.items}
              weekOptions={weekOptions}
              monthWeekOptions={m.monthWeekOptions}
              defaultAddWeek={m.defaultAddWeek}
              defaultOpen={false}
              forceOpen={hasQuery}
              variant="scope"
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          ))}

          {tiers.quarterlyFolds.map((q) => (
            <QuarterlyScopeSection
              key={q.key}
              label={q.label}
              months={q.months}
              weekOptions={weekOptions}
              forceOpen={hasQuery}
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          ))}

          {tiers.unscheduled.length > 0 && (
            <MonthSection
              key="unscheduled"
              label="Unscheduled"
              items={tiers.unscheduled}
              weekOptions={weekOptions}
              monthWeekOptions={[]}
              defaultAddWeek=""
              defaultOpen={false}
              forceOpen={hasQuery}
              variant="unscheduled"
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          )}
        </>
      )}
    </>
  )
}
