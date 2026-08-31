import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SignalRow } from './SignalRow'
import { AddSignalInline } from './AddSignalInline'
import { signalStatusRank } from './SignalStatusDropdown'

const COLS = [
 { key: 'observation', label: 'Observation',  width: '32%', align: 'left'   },
 { key: 'kind',        label: 'Kind',         width: '10%', align: 'center' },
 { key: 'theme',       label: 'Theme',        width: '12%', align: 'left'   },
 { key: 'status',      label: 'Status',       width: '10%', align: 'center' },
 { key: 'note',        label: 'Notes',        width: '22%', align: 'left'   },
 { key: 'source',      label: 'Source',       width: '9%',  align: 'left'   },
 { key: 'actions',     label: '',             width: '5%',  align: 'right'  },
]

const VARIANTS = {
 themed: {
  header: 'bg-gradient-to-r from-indigo-50/70 via-slate-50/30 to-transparent dark:from-indigo-500/[0.07] dark:via-slate-900/40 dark:to-transparent hover:from-indigo-50 hover:via-slate-50/50 dark:hover:from-indigo-500/[0.12] dark:hover:via-slate-900/60',
  rail: 'bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500 dark:from-indigo-400 dark:via-indigo-400 dark:to-violet-400 opacity-90',
  chevron: 'text-indigo-500/80 dark:text-indigo-300/80',
  chip: 'text-indigo-800 dark:text-indigo-100 bg-indigo-100/70 dark:bg-indigo-400/10 ring-1 ring-inset ring-indigo-200/70 dark:ring-indigo-300/20',
  chipMuted: 'text-indigo-700/60 dark:text-indigo-200/60',
 },
 untagged: {
  header: 'bg-gradient-to-r from-slate-50/80 via-slate-50/20 to-transparent dark:from-slate-500/[0.08] dark:via-slate-500/[0.02] dark:to-transparent hover:from-slate-50 dark:hover:from-slate-500/[0.14]',
  rail: 'bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 opacity-90',
  chevron: 'text-slate-500/80 dark:text-slate-300/80',
  chip: 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 ring-1 ring-inset ring-slate-200 dark:ring-slate-700',
  chipMuted: 'text-slate-600/70 dark:text-slate-300/70',
 },
}

function summarize(items) {
 let total = items.length, problems = 0, opps = 0, decided = 0
 for (const it of items) {
  if (it.kind === 'opportunity') opps++
  else problems++
  if (it.status === 'decided') decided++
 }
 return { total, problems, opps, decided }
}

function sortItems(items) {
 return [...items].sort((a, b) => {
  const sa = signalStatusRank(a.status)
  const sb = signalStatusRank(b.status)
  return sa - sb
 })
}

export function ThemeSection({
 label, items, defaultTheme, onDelete, onEditField, onAdd,
 defaultOpen = true, forceOpen = false, variant = 'themed',
}) {
 const [open, setOpen] = useState(defaultOpen)
 useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])

 const v = VARIANTS[variant] || VARIANTS.themed
 const sorted = sortItems(items)
 const { total, problems, opps, decided } = summarize(items)

 return (
  <Card className="overflow-hidden mb-6 border-border/70">
   <button
    type="button"
    onClick={() => setOpen((o) => !o)}
    className={`group relative w-full flex items-center gap-3 px-4 md:px-5 py-3.5 text-left border-b border-border/60 transition-colors duration-200 ${v.header}`}
    aria-expanded={open}
   >
    <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${v.rail}`} />
    <span className={`${v.chevron} transition-transform duration-200 group-hover:translate-x-0.5`}>
     {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </span>
    <span className="text-[15px] font-semibold tracking-tight text-foreground">{label}</span>
    <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${v.chip}`}>
     <span>{total} signal{total === 1 ? '' : 's'}</span>
     {problems > 0 && <span className="text-rose-600 dark:text-rose-300">· {problems} problem{problems === 1 ? '' : 's'}</span>}
     {opps > 0 && <span className="text-emerald-600 dark:text-emerald-300">· {opps} opp{opps === 1 ? '' : 's'}</span>}
     {decided > 0 && <span className={v.chipMuted}>· {decided} decided</span>}
    </span>
   </button>

   {open && (
    <div className="w-full overflow-x-auto">
     <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
      <colgroup>{COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
      <thead className="bg-muted/40 dark:bg-muted/20">
       <tr>
        {COLS.map((c, i) => (
         <th
          key={c.key}
          className={
           `px-4 py-3 text-${c.align} text-[13px] font-semibold text-foreground/70` +
           (i < COLS.length - 1 ? ' border-r border-border/60' : '')
          }
         >
          {c.label}
         </th>
        ))}
       </tr>
      </thead>
      <tbody>
       {sorted.length === 0 ? (
        <tr>
         <td colSpan={COLS.length} className="px-5 py-6 text-center text-sm text-muted-foreground">
          No signals in this theme yet.
         </td>
        </tr>
       ) : (
        sorted.map((s) => (
         <SignalRow
          key={s.id}
          s={s}
          onDelete={onDelete}
          onEditField={onEditField}
         />
        ))
       )}
      </tbody>
     </table>
     {onAdd && (<AddSignalInline defaultTheme={defaultTheme} onAdd={onAdd} />)}
    </div>
   )}
  </Card>
 )
}
