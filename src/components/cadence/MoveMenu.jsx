import { useEffect, useMemo, useRef, useState } from 'react'
import { MoveRight } from 'lucide-react'
import {
 mondayFromLabelSmart, mondayOf, weekLabelFromDate,
 monthKeyFromDate, quarterKeyFromDate,
 formatMonthLabel, formatQuarterLabel,
 currentMonthKey, currentQuarterKey,
} from '@/lib/week'

function groupChoices(options, current) {
 const today = new Date()
 const currentMonday = mondayOf(today).getTime()
 const currentLabel = weekLabelFromDate(today)
 const monthNow = currentMonthKey(today)
 const quarterNow = currentQuarterKey(today)

 const items = options
  .filter((w) => w !== current)
  .map((w) => {
   const monday = mondayFromLabelSmart(w, today)
   return {
    label: w,
    monday: monday?.getTime() ?? null,
    monthKey: monday ? monthKeyFromDate(monday) : null,
    quarterKey: monday ? quarterKeyFromDate(monday) : null,
   }
  })

 const upcoming = items
  .filter((it) => it.monday !== null && it.monday >= currentMonday)
  .sort((a, b) => a.monday - b.monday)
  .map((it) => ({ ...it, isCurrent: it.label === currentLabel }))

 const currentMonthPast = items
  .filter((it) => it.monday !== null && it.monday < currentMonday && it.monthKey === monthNow)
  .sort((a, b) => b.monday - a.monday)

 const monthlyMap = new Map()
 for (const it of items) {
  if (it.monday === null) continue
  if (it.monday >= currentMonday) continue
  if (it.monthKey === monthNow) continue
  if (it.quarterKey !== quarterNow) continue
  if (!monthlyMap.has(it.monthKey)) monthlyMap.set(it.monthKey, [])
  monthlyMap.get(it.monthKey).push(it)
 }
 const monthlyScopes = [...monthlyMap.entries()]
  .sort(([a], [b]) => (a < b ? 1 : -1))
  .map(([key, weeks]) => ({
   key,
   label: formatMonthLabel(key),
   weeks: weeks.sort((a, b) => b.monday - a.monday),
  }))

 const quarterlyMap = new Map()
 for (const it of items) {
  if (it.monday === null) continue
  if (it.quarterKey === quarterNow) continue
  if (!quarterlyMap.has(it.quarterKey)) quarterlyMap.set(it.quarterKey, new Map())
  const mMap = quarterlyMap.get(it.quarterKey)
  if (!mMap.has(it.monthKey)) mMap.set(it.monthKey, [])
  mMap.get(it.monthKey).push(it)
 }
 const quarterlyScopes = [...quarterlyMap.entries()]
  .sort(([a], [b]) => (a < b ? 1 : -1))
  .map(([qKey, mMap]) => ({
   key: qKey,
   label: formatQuarterLabel(qKey),
   months: [...mMap.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([mKey, weeks]) => ({
     key: mKey,
     label: formatMonthLabel(mKey),
     weeks: weeks.sort((a, b) => b.monday - a.monday),
    })),
  }))

 const orphans = items.filter((it) => it.monday === null)

 return { upcoming, currentMonthPast, monthlyScopes, quarterlyScopes, orphans }
}

function WeekItem({ w, onPick, badge, tone = 'default' }) {
 return (
  <button
   onClick={() => onPick(w.label)}
   className={
    'w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors duration-200 flex items-center gap-2 ' +
    (tone === 'muted' ? 'text-foreground/80' : 'text-foreground')
   }
  >
   <span>{w.label}</span>
   {badge && (
    <span className="ml-auto text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
     {badge}
    </span>
   )}
  </button>
 )
}

function GroupHeading({ children, tone = 'muted' }) {
 const tones = {
  muted: 'text-muted-foreground/80',
  amber: 'text-amber-700/85 dark:text-amber-300/85',
  rose: 'text-rose-700/85 dark:text-rose-300/85',
 }
 return (
  <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}>
   {children}
  </div>
 )
}

export function MoveMenu({ current, options, onSelect }) {
 const [open, setOpen] = useState(false)
 const ref = useRef(null)

 useEffect(() => {
  if (!open) return
  const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
  const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
  window.addEventListener('mousedown', onDoc)
  window.addEventListener('keydown', onKey)
  return () => { window.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey) }
 }, [open])

 const groups = useMemo(() => groupChoices(options, current), [options, current])
 const pick = (label) => { onSelect(label); setOpen(false) }
 const isEmpty =
  groups.upcoming.length === 0 &&
  groups.currentMonthPast.length === 0 &&
  groups.monthlyScopes.length === 0 &&
  groups.quarterlyScopes.length === 0 &&
  groups.orphans.length === 0

 return (
  <div className="relative group" ref={ref}>
   <button
    onClick={() => setOpen((v) => !v)}
    aria-label="Move to another week"
    aria-haspopup="menu"
    aria-expanded={open}
    className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
   >
    <MoveRight size={13} />
   </button>
   {!open && (
    <span
     role="tooltip"
     className="pointer-events-none absolute right-0 top-[calc(100%+4px)] whitespace-nowrap rounded-md bg-foreground text-background text-[11px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-40"
    >
     Move to another week
    </span>
   )}
   {open && (
    <div className="absolute right-0 top-8 z-40 min-w-[260px] max-h-[420px] overflow-y-auto bg-card border border-border rounded-lg shadow-lg py-1 animate-fade-in">
     {isEmpty ? (
      <div className="px-3 py-2 text-xs text-muted-foreground">No other weeks yet.</div>
     ) : (
      <>
       {groups.upcoming.length > 0 && (
        <>
         <GroupHeading tone="muted">This & upcoming</GroupHeading>
         {groups.upcoming.map((w) => (
          <WeekItem key={w.label} w={w} onPick={pick} badge={w.isCurrent ? 'This week' : null} />
         ))}
        </>
       )}

       {groups.currentMonthPast.length > 0 && (
        <>
         <div className="my-1 border-t border-border/60" />
         <GroupHeading tone="muted">Earlier this month</GroupHeading>
         {groups.currentMonthPast.map((w) => (
          <WeekItem key={w.label} w={w} onPick={pick} tone="muted" />
         ))}
        </>
       )}

       {groups.monthlyScopes.map((m) => (
        <div key={m.key}>
         <div className="my-1 border-t border-border/60" />
         <GroupHeading tone="amber">Monthly Scope · {m.label}</GroupHeading>
         {m.weeks.map((w) => (
          <WeekItem key={w.label} w={w} onPick={pick} tone="muted" />
         ))}
        </div>
       ))}

       {groups.quarterlyScopes.map((q) => (
        <div key={q.key}>
         <div className="my-1 border-t border-border/60" />
         <GroupHeading tone="rose">Quarterly Scope · {q.label}</GroupHeading>
         {q.months.map((m) => (
          <div key={m.key}>
           <div className="px-3 pt-1 text-[10px] font-medium text-rose-700/70 dark:text-rose-300/70">
            {m.label}
           </div>
           {m.weeks.map((w) => (
            <WeekItem key={w.label} w={w} onPick={pick} tone="muted" />
           ))}
          </div>
         ))}
        </div>
       ))}

       {groups.orphans.length > 0 && (
        <>
         <div className="my-1 border-t border-border/60" />
         <GroupHeading tone="muted">Other</GroupHeading>
         {groups.orphans.map((w) => (
          <WeekItem key={w.label} w={w} onPick={pick} tone="muted" />
         ))}
        </>
       )}
      </>
     )}
    </div>
   )}
  </div>
 )
}
