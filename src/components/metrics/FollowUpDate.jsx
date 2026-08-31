import { cn } from '@/lib/utils'

export function followUpBucket(iso, today = new Date()) {
 if (!iso) return 'none'
 const d = new Date(iso)
 if (isNaN(d.getTime())) return 'none'
 const t0 = new Date(today); t0.setHours(0, 0, 0, 0)
 const t1 = new Date(d); t1.setHours(0, 0, 0, 0)
 const diff = Math.round((t1 - t0) / 86400000)
 if (diff < 0) return 'overdue'
 if (diff === 0) return 'today'
 if (diff <= 7) return 'week'
 if (diff <= 30) return 'soon'
 return 'later'
}

export const FOLLOW_UP_BUCKETS = [
 { key: 'all',     label: 'All' },
 { key: 'overdue', label: 'Overdue' },
 { key: 'today',   label: 'Today' },
 { key: 'week',    label: 'This week' },
 { key: 'soon',    label: 'Next 30 days' },
 { key: 'later',   label: 'Later' },
 { key: 'none',    label: 'No date' },
]

const BUCKET_STYLE = {
 overdue: 'text-rose-700 bg-rose-50 ring-rose-200/70 dark:text-rose-200 dark:bg-rose-500/10 dark:ring-rose-500/30',
 today:   'text-amber-700 bg-amber-50 ring-amber-200/70 dark:text-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30',
 week:    'text-blue-700 bg-blue-50 ring-blue-200/70 dark:text-blue-200 dark:bg-blue-500/10 dark:ring-blue-500/30',
 soon:    'text-indigo-700 bg-indigo-50 ring-indigo-200/70 dark:text-indigo-200 dark:bg-indigo-500/10 dark:ring-indigo-500/30',
 later:   'text-slate-700 bg-slate-100 ring-slate-200/70 dark:text-slate-300 dark:bg-slate-800/50 dark:ring-slate-700/70',
 none:    'text-muted-foreground bg-transparent ring-border',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(iso) {
 if (!iso) return ''
 const d = new Date(iso)
 if (isNaN(d.getTime())) return iso
 return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function relativeLabel(iso, today = new Date()) {
 if (!iso) return ''
 const d = new Date(iso)
 if (isNaN(d.getTime())) return ''
 const t0 = new Date(today); t0.setHours(0, 0, 0, 0)
 const t1 = new Date(d); t1.setHours(0, 0, 0, 0)
 const diff = Math.round((t1 - t0) / 86400000)
 if (diff === 0) return 'Today'
 if (diff === 1) return 'Tomorrow'
 if (diff === -1) return 'Yesterday'
 if (diff > 0) return `in ${diff}d`
 return `${Math.abs(diff)}d ago`
}

export function FollowUpDate({ value, onChange }) {
 const bucket = followUpBucket(value)
 const label = value ? formatDate(value) : 'Set date'
 const rel = value ? relativeLabel(value) : ''
 return (
  <label
   className={cn(
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums ring-1 ring-inset cursor-pointer transition-colors hover:opacity-90 whitespace-nowrap',
    BUCKET_STYLE[bucket]
   )}
   title={value ? `Follow-up ${label}${rel ? ` (${rel})` : ''}` : 'Add follow-up date'}
  >
   <span>{label}</span>
   {rel && <span className="opacity-70">· {rel}</span>}
   <input
    type="date"
    value={value || ''}
    onChange={(e) => onChange(e.target.value || '')}
    className="sr-only"
    aria-label="Follow-up date"
   />
  </label>
 )
}
