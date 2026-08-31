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
  formatMonthLabel, formatQuarterFromMonths,
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

function weekRank(weekLabel, today) {
  const m = mondayFromLabelSmart(weekLabel, today)?.getTime() || 0
  if (!m) return [3, 0]
  const cm = mondayOf(today).getTime()
  if (m > cm) return [0, m - cm]
  if (m === cm) return [1, 0]
  return [2, cm - m]
}

function sortByWeekAndStatus(list, today) {
  return [...list].sort((a, b) => {
    const [ta, na] = weekRank(a.weekLabel, today)
    const [tb, nb] = weekRank(b.weekLabel, today)
    if (ta !== tb) return ta - tb
    if (na !== nb) return na - nb
    return statusRank(a.status) - statusRank(b.status)
  })
}

function buildMonthWeekOptions(itemWeeks, monthKey, today) {
  const set = new Set(itemWeeks)
  const [y, m] = monthKey.split('-').map(Number)
  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = new Date(y, m, 0)
  let cursor = mondayOf(monthStart)
  while (cursor <= monthEnd) {
    if (cursor.getMonth() === m - 1) set.add(weekLabelFromDate(cursor))
    const next = new Date(cursor); next.setDate(next.getDate() + 7)
    cursor = next
  }
  return [...set].sort((a, b) => {
    const ma = mondayFromLabelSmart(a, today)?.getTime() || 0
    const mb = mondayFromLabelSmart(b, today)?.getTime() || 0
    return mb - ma
  })
}

// Layout: current month standalone (top), current quarter's completed months
// inside a Q# Scope card, then past-quarter scope cards, then unscheduled.
// Everything reverse-chrono: most recent first inside each card.
function buildLayout(items, filter, today, currentLabel) {
  const filtered = filterItems(items, filter)
  const monthNow = currentMonthKey(today)
  const quarterNow = currentQuarterKey(today)

  const monthBuckets = new Map()
  const unscheduled = []

  const bucketFor = (mk, qk) => {
    if (!monthBuckets.has(mk)) monthBuckets.set(mk, { items: [], weeks: new Set(), quarterKey: qk })
    return monthBuckets.get(mk)
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

  if (!filter && !monthBuckets.has(monthNow)) bucketFor(monthNow, quarterNow)
  if (monthBuckets.has(monthNow) && currentLabel) monthBuckets.get(monthNow).weeks.add(currentLabel)

  const entryFor = (mKey, b) => {
    const monthWeekOptions = buildMonthWeekOptions(b.weeks, mKey, today)
    const defaultAddWeek = monthWeekOptions.includes(currentLabel) ? currentLabel : monthWeekOptions[0]
    return {
      key: mKey,
      label: formatMonthLabel(mKey),
      items: sortByWeekAndStatus(b.items, today),
      monthWeekOptions,
      defaultAddWeek,
    }
  }

  const quarterBuckets = new Map() // qKey → Map<mKey, entry>
  for (const [mKey, b] of monthBuckets.entries()) {
    const entry = entryFor(mKey, b)
    if (!quarterBuckets.has(b.quarterKey)) quarterBuckets.set(b.quarterKey, new Map())
    quarterBuckets.get(b.quarterKey).set(mKey, entry)
  }

  let liveMonth = null
  let currentQuarterScope = null
  const currentQMap = quarterBuckets.get(quarterNow)
  if (currentQMap) {
    liveMonth = currentQMap.get(monthNow) || null
    const completed = [...currentQMap.entries()]
      .filter(([mKey]) => mKey !== monthNow)
      .sort(([a], [b]) => (a < b ? 1 : -1))    // reverse-chrono
      .map(([, entry]) => entry)
    if (completed.length > 0) {
      currentQuarterScope = {
        key: quarterNow,
        label: formatQuarterFromMonths(quarterNow, completed.map((m) => m.key)),
        months: completed,
      }
    }
  }

  const pastQuarters = [...quarterBuckets.entries()]
    .filter(([qKey]) => qKey !== quarterNow)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([qKey, mMap]) => {
      const months = [...mMap.entries()]
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([, entry]) => entry)
      return {
        key: qKey,
        label: formatQuarterFromMonths(qKey, months.map((m) => m.key)),
        months,
      }
    })

  return {
    liveMonth,
    currentQuarterScope,
    pastQuarters,
    unscheduled: sortByWeekAndStatus(unscheduled, today),
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

  const layout = useMemo(
    () => buildLayout(followUps, query, today, currentWeek),
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
    && !layout.liveMonth
    && !layout.currentQuarterScope
    && layout.pastQuarters.length === 0
    && layout.unscheduled.length === 0

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
          {layout.liveMonth && (
            <MonthSection
              key={layout.liveMonth.key}
              label={layout.liveMonth.label}
              items={layout.liveMonth.items}
              weekOptions={weekOptions}
              monthWeekOptions={layout.liveMonth.monthWeekOptions}
              defaultAddWeek={layout.liveMonth.defaultAddWeek}
              defaultOpen={true}
              forceOpen={hasQuery}
              variant="current"
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          )}

          {layout.currentQuarterScope && (
            <QuarterlyScopeSection
              key={layout.currentQuarterScope.key}
              label={layout.currentQuarterScope.label}
              months={layout.currentQuarterScope.months}
              weekOptions={weekOptions}
              defaultOpen={false}
              forceOpen={hasQuery}
              variant="current"
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          )}

          {layout.pastQuarters.map((q) => (
            <QuarterlyScopeSection
              key={q.key}
              label={q.label}
              months={q.months}
              weekOptions={weekOptions}
              defaultOpen={false}
              forceOpen={hasQuery}
              variant="past"
              onDelete={removeFollowUp}
              onEditField={editField}
              onMoveWeek={moveWeek}
              onAdd={addFollowUp}
            />
          ))}

          {layout.unscheduled.length > 0 && (
            <MonthSection
              key="unscheduled"
              label="Unscheduled"
              items={layout.unscheduled}
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
