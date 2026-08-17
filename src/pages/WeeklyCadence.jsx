import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { WeekSection } from '@/components/cadence/WeekSection'
import { MonthlyScopeSection } from '@/components/cadence/MonthlyScopeSection'
import { QuarterlyScopeSection } from '@/components/cadence/QuarterlyScopeSection'
import { toast } from '@/components/ui/toaster'
import {
  weekLabelFromDate, suggestedWeekOptions,
  mondayFromLabelSmart, monthKeyFromDate, quarterKeyFromDate,
  formatMonthLabel, formatQuarterLabel,
  currentMonthKey, currentQuarterKey,
} from '@/lib/week'
import { listFollowUps, insertFollowUp, updateFollowUp, deleteFollowUp } from '@/lib/api'

const UNSCHEDULED = 'Unscheduled'
const FIELD_TO_DB = { item: 'item', owner: 'owner', statusNote: 'status_note', kind: 'kind', status: 'status' }

function filterItems(items, filter) {
  const q = filter.trim().toLowerCase()
  if (!q) return items
  return items.filter((f) => [f.item, f.owner, f.statusNote].some((v) => (v || '').toLowerCase().includes(q)))
}

function sortWithinWeek(list) {
  return [...list].sort((a, b) => (a.status === 'blocker' ? 1 : 0) - (b.status === 'blocker' ? 1 : 0))
}

function buildTiers(items, filter, today, currentLabel) {
  const filtered = filterItems(items, filter)
  const monthNow = currentMonthKey(today)
  const quarterNow = currentQuarterKey(today)

  const byWeek = new Map()
  const unscheduled = []
  const weekMeta = new Map()

  for (const f of filtered) {
    if (!f.weekLabel) { unscheduled.push(f); continue }
    if (!byWeek.has(f.weekLabel)) byWeek.set(f.weekLabel, [])
    byWeek.get(f.weekLabel).push(f)
    if (!weekMeta.has(f.weekLabel)) {
      const monday = mondayFromLabelSmart(f.weekLabel, today)
      weekMeta.set(f.weekLabel, {
        monday,
        monthKey: monday ? monthKeyFromDate(monday) : null,
        quarterKey: monday ? quarterKeyFromDate(monday) : null,
      })
    }
  }

  if (!filter && !byWeek.has(currentLabel)) {
    byWeek.set(currentLabel, [])
    const monday = mondayFromLabelSmart(currentLabel, today)
    weekMeta.set(currentLabel, {
      monday,
      monthKey: monday ? monthKeyFromDate(monday) : null,
      quarterKey: monday ? quarterKeyFromDate(monday) : null,
    })
  }

  const liveWeeks = []
  const monthBuckets = new Map()
  const quarterBuckets = new Map()

  for (const [label, list] of byWeek) {
    const meta = weekMeta.get(label) || {}
    const entry = { label, items: sortWithinWeek(list), monday: meta.monday }

    if (!meta.monthKey || meta.monthKey === monthNow) {
      liveWeeks.push(entry)
    } else if (meta.quarterKey === quarterNow) {
      if (!monthBuckets.has(meta.monthKey)) monthBuckets.set(meta.monthKey, [])
      monthBuckets.get(meta.monthKey).push(entry)
    } else {
      if (!quarterBuckets.has(meta.quarterKey)) quarterBuckets.set(meta.quarterKey, new Map())
      const mMap = quarterBuckets.get(meta.quarterKey)
      if (!mMap.has(meta.monthKey)) mMap.set(meta.monthKey, [])
      mMap.get(meta.monthKey).push(entry)
    }
  }

  liveWeeks.sort((a, b) => (b.monday?.getTime() || 0) - (a.monday?.getTime() || 0))

  const monthlyFolds = [...monthBuckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, weeks]) => ({
      key,
      label: formatMonthLabel(key),
      weeks: weeks.sort((a, b) => (b.monday?.getTime() || 0) - (a.monday?.getTime() || 0)),
    }))

  const quarterlyFolds = [...quarterBuckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([qKey, mMap]) => ({
      key: qKey,
      label: formatQuarterLabel(qKey),
      months: [...mMap.entries()]
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([mKey, weeks]) => ({
          key: mKey,
          label: formatMonthLabel(mKey),
          weeks: weeks.sort((a, b) => (b.monday?.getTime() || 0) - (a.monday?.getTime() || 0)),
        })),
    }))

  return { liveWeeks, monthlyFolds, quarterlyFolds, unscheduled: sortWithinWeek(unscheduled) }
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

  const tiers = useMemo(
    () => buildTiers(followUps, query, new Date(), currentWeek),
    [followUps, currentWeek, query]
  )

  const weekOptions = useMemo(() => {
    const today = new Date()
    const set = new Set([
      ...suggestedWeekOptions(),
      ...followUps.map((f) => f.weekLabel).filter(Boolean),
    ])
    return [...set].sort((a, b) => {
      const ma = mondayFromLabelSmart(a, today)
      const mb = mondayFromLabelSmart(b, today)
      return (mb?.getTime() || 0) - (ma?.getTime() || 0)
    })
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
      ) : hasQuery && tiers.liveWeeks.every((g) => g.items.length === 0)
            && tiers.monthlyFolds.length === 0
            && tiers.quarterlyFolds.length === 0
            && tiers.unscheduled.length === 0 ? (
        <Card><EmptyState icon={Search} title="No matches" description={`Nothing matches "${query}".`} /></Card>
      ) : (
        <>
          {tiers.liveWeeks.map(({ label, items }) => (
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
          ))}

          {tiers.monthlyFolds.map((m) => (
            <MonthlyScopeSection
              key={m.key}
              label={m.label}
              weeks={m.weeks}
              weekOptions={weekOptions}
              forceOpen={hasQuery}
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
            <WeekSection
              key={UNSCHEDULED}
              label={UNSCHEDULED}
              items={tiers.unscheduled}
              weekOptions={weekOptions}
              defaultOpen={false}
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
