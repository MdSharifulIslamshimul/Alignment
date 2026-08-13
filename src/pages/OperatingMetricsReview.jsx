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
import { listMetrics, insertMetric, updateMetric, deleteMetric } from '@/lib/api'

const COLS = [
  { key: 'n',        label: '#',              width: '3%',  align: 'left' },
  { key: 'obj',      label: 'Objective',      width: '14%' },
  { key: 'init',     label: 'Initiative',     width: '24%' },
  { key: 'squad',    label: 'Squads',         width: '13%' },
  { key: 'metric',   label: 'Success Metric', width: '15%' },
  { key: 'baseline', label: 'Baseline',       width: '8%',  align: 'right' },
  { key: 'target',   label: 'Target',         width: '8%',  align: 'right' },
  { key: 'achieved', label: 'Achieved',       width: '10%' },
  { key: 'actions',  label: '',               width: '5%' },
]
const PAGE_SIZE = 10
const BLANK = { objective: '', initiative: '', squad: '', metric: '', baseline: '', target: '', delivery: '', followUp: '', achieved: '', owner: '' }

export default function OperatingMetricsReview() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [squad, setSquad] = useState('all')
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
  const filtered = useMemo(
    () => (squad === 'all' ? rows : rows.filter((r) => r.squad === squad)),
    [rows, squad]
  )
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
        description="Are we hitting the targets that matter?"
        actions={
          <div className="flex items-center gap-2">
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

      <Card className="overflow-hidden">
        {status === 'loading' ? (
          <LoadingBlock label="Loading metrics…" />
        ) : status === 'error' ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={rows.length === 0 ? 'No metrics yet' : 'No matches for this squad'}
            description={rows.length === 0 ? 'Add a metric to start tracking.' : 'Change the filter or clear it.'}
            action={rows.length === 0
              ? <Button size="sm" onClick={addRow}><Plus size={14} /> Add Metric</Button>
              : <Button size="sm" variant="secondary" onClick={() => setSquad('all')}>All squads</Button>}
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <colgroup>{COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
              <thead className="bg-muted/40">
                <tr>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      className={`px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${c.align === 'right' ? 'text-right' : 'text-left'}`}
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
