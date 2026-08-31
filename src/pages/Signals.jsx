import { useEffect, useMemo, useRef, useState } from 'react'
import { Radar, Search, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { toast } from '@/components/ui/toaster'
import { ThemeSection } from '@/components/signals/ThemeSection'
import { AddSignalInline } from '@/components/signals/AddSignalInline'
import { listSignals, insertSignal, updateSignal, deleteSignal } from '@/lib/api'

const FIELD_TO_DB = { observation: 'observation', kind: 'kind', theme: 'theme', status: 'status', note: 'note', source: 'source' }
const UNTAGGED = '__untagged__'

function groupByTheme(items) {
 const map = new Map()
 for (const s of items) {
  const key = (s.theme || '').trim() || UNTAGGED
  if (!map.has(key)) map.set(key, [])
  map.get(key).push(s)
 }
 const themed = []
 let untagged = null
 for (const [key, list] of map.entries()) {
  const entry = { key, label: key === UNTAGGED ? 'Untagged' : key, items: list }
  if (key === UNTAGGED) untagged = entry
  else themed.push(entry)
 }
 // Order themes by descending signal count, ties alphabetical.
 themed.sort((a, b) => (b.items.length - a.items.length) || a.label.localeCompare(b.label))
 return { themed, untagged }
}

function filterItems(items, query, kind) {
 const q = query.trim().toLowerCase()
 let out = items
 if (kind !== 'all') out = out.filter((s) => (s.kind || 'problem') === kind)
 if (!q) return out
 return out.filter((s) => [s.observation, s.theme, s.note, s.source].some((v) => (v || '').toLowerCase().includes(q)))
}

export default function Signals() {
 const [signals, setSignals] = useState([])
 const [status, setStatus] = useState('loading')
 const [error, setError] = useState(null)
 const [query, setQuery] = useState('')
 const [kindFilter, setKindFilter] = useState('all')
 const searchRef = useRef(null)

 const load = async () => {
  setStatus('loading'); setError(null)
  try { setSignals(await listSignals()); setStatus('ready') }
  catch (e) { setError(e.message); setStatus('error') }
 }
 useEffect(() => { load() }, [])

 useEffect(() => {
  const onKey = (e) => {
   if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus() }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
 }, [])

 const filtered = useMemo(() => filterItems(signals, query, kindFilter), [signals, query, kindFilter])
 const groups = useMemo(() => groupByTheme(filtered), [filtered])

 const totals = useMemo(() => {
  let problems = 0, opps = 0, decided = 0, dismissed = 0, exploring = 0, fresh = 0
  for (const s of signals) {
   if (s.kind === 'opportunity') opps++
   else problems++
   if (s.status === 'decided') decided++
   else if (s.status === 'dismissed') dismissed++
   else if (s.status === 'exploring') exploring++
   else fresh++
  }
  return { total: signals.length, problems, opps, decided, dismissed, exploring, fresh }
 }, [signals])

 const themeNames = useMemo(() => {
  const set = new Set(signals.map((s) => (s.theme || '').trim()).filter(Boolean))
  return [...set].sort()
 }, [signals])

 const editField = async (id, field, value) => {
  setSignals((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  const dbKey = FIELD_TO_DB[field]; if (!dbKey) return
  await updateSignal(id, { [dbKey]: value }).catch((e) => setError(e.message))
 }
 const removeSignal = async (id) => {
  const snapshot = signals.find((r) => r.id === id)
  if (!snapshot) return
  setSignals((rs) => rs.filter((r) => r.id !== id))
  let undone = false
  toast({
   message: `Deleted "${(snapshot.observation || 'signal').slice(0, 40)}"`,
   duration: 5000,
   action: {
    label: 'Undo',
    onClick: () => { undone = true; setSignals((rs) => [snapshot, ...rs]) },
   },
  })
  setTimeout(async () => {
   if (!undone) await deleteSignal(id).catch((e) => setError(e.message))
  }, 5000)
 }
 const addSignal = async (payload) => {
  const created = await insertSignal(payload).catch((e) => { setError(e.message); return null })
  if (created) setSignals((rs) => [created, ...rs])
 }

 if (status === 'loading') {
  return (<><PageHeader title="Signals" description="Problems and opportunities surfaced from meetings, grouped into themes." /><Card><LoadingBlock label="Loading…" /></Card></>)
 }
 if (status === 'error') {
  return (<><PageHeader title="Signals" /><Card><ErrorState message={error} onRetry={load} /></Card></>)
 }

 const hasQuery = query.trim().length > 0
 const nothingVisible = (groups.themed.length === 0 && !groups.untagged)

 return (
  <>
   <PageHeader
    title="Signals"
    description="Problems and opportunities surfaced from meetings, grouped into themes."
    actions={
     <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-1 rounded-lg border border-input p-0.5 bg-muted/40">
       {['all', 'problem', 'opportunity'].map((k) => (
        <button
         key={k}
         type="button"
         onClick={() => setKindFilter(k)}
         className={
          'px-2.5 h-7 text-xs font-medium rounded-md transition-colors duration-200 ' +
          (kindFilter === k
           ? (k === 'problem' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200' :
             k === 'opportunity' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' :
             'bg-card text-foreground shadow-sm')
           : 'text-muted-foreground hover:text-foreground')
         }
        >
         {k === 'all' ? 'All' : k === 'problem' ? 'Problems' : 'Opportunities'}
        </button>
       ))}
      </div>
      <div className="relative w-full max-w-xs">
       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
       <Input
        ref={searchRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search signals…"
        className="pl-9 pr-14 h-9"
        aria-label="Search signals"
       />
       <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-medium text-muted-foreground border border-border bg-muted/40 absolute right-2 top-1/2 -translate-y-1/2 tabular-nums">
        ⌘K
       </kbd>
      </div>
     </div>
    }
   />

   {signals.length > 0 && (
    <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
     <span className="text-muted-foreground">{totals.total} signals total</span>
     <span className="text-muted-foreground">·</span>
     <span className="text-rose-700 dark:text-rose-300">{totals.problems} problems</span>
     <span className="text-muted-foreground">·</span>
     <span className="text-emerald-700 dark:text-emerald-300">{totals.opps} opportunities</span>
     <span className="text-muted-foreground">·</span>
     <span className="text-blue-700 dark:text-blue-300">{totals.exploring} exploring</span>
     <span className="text-muted-foreground">·</span>
     <span className="text-green-700 dark:text-green-300">{totals.decided} decided</span>
     {themeNames.length > 0 && (
      <>
       <span className="text-muted-foreground">·</span>
       <span className="text-muted-foreground">{themeNames.length} theme{themeNames.length === 1 ? '' : 's'}</span>
      </>
     )}
    </div>
   )}

   {signals.length === 0 ? (
    <Card>
     <EmptyState
      icon={Radar}
      title="No signals yet"
      description={'Capture the questions surfacing in your meetings. Two examples to seed the habit: "Should we show a coupon on the payment page?" · "Should we ask for OTP before payment?"'}
      action={<Button size="sm" onClick={() => addSignal({ observation: '', kind: 'problem', theme: '', status: 'new', note: '', source: '' })}><Plus size={14} /> Add first signal</Button>}
     />
    </Card>
   ) : hasQuery && nothingVisible ? (
    <Card><EmptyState icon={Search} title="No matches" description={`Nothing matches "${query}".`} /></Card>
   ) : nothingVisible ? (
    <Card><EmptyState icon={Radar} title="Nothing in this filter" description="Change the Problem/Opportunity filter to see the rest." /></Card>
   ) : (
    <>
     {groups.themed.map((g) => (
      <ThemeSection
       key={g.key}
       label={g.label}
       items={g.items}
       defaultTheme={g.label === 'Untagged' ? '' : g.label}
       defaultOpen={true}
       forceOpen={hasQuery}
       variant="themed"
       onDelete={removeSignal}
       onEditField={editField}
       onAdd={addSignal}
      />
     ))}
     {groups.untagged && (
      <ThemeSection
       key={UNTAGGED}
       label="Untagged"
       items={groups.untagged.items}
       defaultTheme=""
       defaultOpen={groups.themed.length === 0}
       forceOpen={hasQuery}
       variant="untagged"
       onDelete={removeSignal}
       onEditField={editField}
       onAdd={addSignal}
      />
     )}
     {!groups.untagged && (
      <Card className="mb-6 border-border/70 border-dashed">
       <AddSignalInline onAdd={addSignal} />
      </Card>
     )}
    </>
   )}
  </>
 )
}
