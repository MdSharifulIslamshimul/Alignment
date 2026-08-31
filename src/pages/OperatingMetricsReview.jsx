import { useMemo, useState, useEffect } from 'react'
import { Plus, RefreshCw, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricRow } from '@/components/metrics/MetricRow'
import { ImportButton } from '@/components/metrics/ImportButton'
import { FOLLOW_UP_BUCKETS, followUpBucket } from '@/components/metrics/FollowUpDate'
import { listMetrics, insertMetric, updateMetric, deleteMetric } from '@/lib/api'
import { cn } from '@/lib/utils'

// Table uses min-widths so Baseline/Target/Achieved/Follow-up don't get squashed;
// wrapping columns (Objective, Initiative, Success Metric) grow with `w-*` on the
// header. The container has overflow-x-auto so narrower viewports scroll.
const COLS = [
  { key: 'n',        label: '#',              minW: 42,  align: 'left'  },
  { key: 'obj',      label: 'Objective',      minW: 140, align: 'left'  },
  { key: 'init',     label: 'Initiative',     minW: 220, align: 'left'  },
  { key: 'squad',    label: 'Squads',         minW: 120, align: 'left'  },
  { key: 'metric',   label: 'Success Metric', minW: 180, align: 'left'  },
  { key: 'baseline', label: 'Baseline',       minW: 80,  align: 'right' },
  { key: 'target',   label: 'Target',         minW: 90,  align: 'right' },
  { key: 'achieved', label: 'Achieved',       minW: 120, align: 'left'  },
  { key: 'followUp', label: 'Follow-up',      minW: 130, align: 'left'  },
  { key: 'actions',  label: '',               minW: 44,  align: 'right' },
]

const PAGE_SIZE = 10
const BLANK = { objective: '', initiative: '', squad: '', metric: '', baseline: '', target: '', delivery: '', followUp: '', achieved: '', owner: '' }

export default function OperatingMetricsReview() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [squad, setSquad] = useState('all')
  const [followUpFilter, setFollowUpFilter] = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const load = async () => {
    setStatus('loading'); setError(null)
    try { setRows(await listMetrics()); setStatus('ready') }
    catch (e) { setError(e.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  const squads = useMemo(() => {
    const s = new Set(rows.map((r) => r.squad).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [rows])

  const filtered = useMemo(() => {
    let out = rows
    if (squad !== 'all') out = out.filter((r) => r.squad === squad)
    if (followUpFilter !== 'all') out = out.filter((r) => followUpBucket(r.followUp) === followUpFilter)
    return out
  }, [rows, squad, followUpFilter])

  const followUpCounts = useMemo(() => {
    const counts = { all: rows.length, overdue: 0, today: 0, week: 0, soon: 0, later: 0, none: 0 }
    for (const r of rows) counts[followUpBucket(r.followUp)]++
    return counts
  }, [rows])

  const shown = filtered.slice(0, visible)

  const updateCell = async (id, key, value) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
    await updateMetric(id, { [key]: value }).catch((e) => setError(e.message))
  }
  const removeRow = async (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id))
    await deleteMetric(id).catch((e) => setError(e.message))
  }
  const addRow = async () => {
    const created = await insertMetric(BLANK).catch((e) => { setError(e.message); return null })
    if (created) { setRows((rs) => [created, ...rs]); setVisible((n) => n + 1) }
  }
  const onClickUpPopulate = () => {
    alert('ClickUp sync — connect a list in settings to populate automatically. Coming soon.')
  }

  return (
    <>
      <PageHeader
        title="Operating Metrics Review"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={squad} onChange={(e) => { setSquad(e.target.value); setVisible(PAGE_SIZE) }} className="h-9 w-[140px]">
              {squads.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Squads' : s}</option>
              ))}
            </Select>
            <ImportButton existingCount={rows.length} onImported={(inserted, mode) => setRows((rs) => (mode === 'replace' ? inserted : [...inserted, ...rs]))} />
            <Button variant="outline" size="sm" onClick={onClickUpPopulate}>
              <RefreshCw size={14} /> Populate from ClickUp
            </Button>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus size={14} /> Add Metric
            </Button>
          </div>
        }
      />

      {rows.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mr-1">Follow-up</span>
          {FOLLOW_UP_BUCKETS.map((b) => {
            const count = followUpCounts[b.key] ?? 0
            const active = followUpFilter === b.key
            const isEmpty = b.key !== 'all' && count === 0
            return (
              <button
                key={b.key}
                type="button"
                disabled={isEmpty}
                onClick={() => { setFollowUpFilter(b.key); setVisible(PAGE_SIZE) }}
                className={cn(
                  'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-colors duration-150 tabular-nums',
                  active
                    ? (b.key === 'overdue' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-100'
                      : b.key === 'today' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100'
                      : b.key === 'week' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-100'
                      : b.key === 'soon' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-100'
                      : b.key === 'later' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                      : b.key === 'none' ? 'bg-muted text-foreground'
                      : 'bg-foreground text-background')
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  isEmpty && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span>{b.label}</span>
                <span className={cn('opacity-70', active && 'opacity-100')}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      <Card className="overflow-hidden">
        {status === 'loading' ? (
          <LoadingBlock label="Loading metrics…" />
        ) : status === 'error' ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={rows.length === 0 ? 'No metrics yet' : 'No matches for the current filters'}
            description={rows.length === 0 ? 'Add a metric to start tracking.' : 'Change or clear the filters above.'}
            action={rows.length === 0
              ? <Button size="sm" onClick={addRow}><Plus size={14} /> Add Metric</Button>
              : <Button size="sm" variant="secondary" onClick={() => { setSquad('all'); setFollowUpFilter('all') }}>Clear filters</Button>}
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: COLS.reduce((s, c) => s + c.minW, 0) }}>
              <thead className="bg-muted/40">
                <tr>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      style={{ minWidth: c.minW }}
                      className={`px-3 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row, i) => (
                  <MetricRow
                    key={row.id}
                    index={i + 1}
                    row={row}
                    onChange={updateCell}
                    onDelete={removeRow}
                  />
                ))}
              </tbody>
            </table>
            {filtered.length > visible && (
              <button
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="w-full flex items-center justify-center gap-2 py-3 border-t border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200"
              >
                <ChevronDown size={14} /> Show more ({filtered.length - visible} more of {filtered.length})
              </button>
            )}
          </div>
        )}
      </Card>
    </>
  )
}
