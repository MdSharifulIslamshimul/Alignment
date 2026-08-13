import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { MetricRow } from '@/components/metrics/MetricRow'
import { ImportButton } from '@/components/metrics/ImportButton'
import { listMetrics, insertMetric, updateMetric, deleteMetric } from '@/lib/api'

const COLS = [
  'Objective (Short Name)', 'Initiative', 'Squads / Wing', 'Success Metric',
  'Baseline', 'Target', 'Delivery Date', 'Follow Up Date', 'Achieved', 'Owner', '',
]
const BLANK = { objective: '', initiative: '', squad: '', metric: '', baseline: '', target: '', delivery: '', followUp: '', achieved: 'On track', owner: '' }

export default function OperatingMetricsReview() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [q, setQ] = useState('')

  const load = async () => {
    setStatus('loading'); setError(null)
    const data = await listMetrics().catch((e) => { setError(e.message); return null })
    if (data) { setRows(data); setStatus('ready') } else { setStatus('error') }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(s))) : rows
  }, [rows, q])

  const updateCell = (id, key, value) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  }
  const persistRow = async (id) => {
    const row = rows.find((r) => r.id === id)
    if (row) await updateMetric(id, row).catch((e) => setError(e.message))
  }
  const toggleEdit = async (id) => {
    if (editingId === id) { await persistRow(id); setEditingId(null) } else setEditingId(id)
  }
  const removeRow = async (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id))
    if (editingId === id) setEditingId(null)
    await deleteMetric(id).catch((e) => setError(e.message))
  }
  const addRow = async () => {
    const created = await insertMetric(BLANK).catch((e) => { setError(e.message); return null })
    if (created) { setRows((rs) => [created, ...rs]); setEditingId(created.id) }
  }

  return (
    <>
      <PageHeader
        title="Operating Metrics Review"
        description="Objectives, initiatives, and success metrics — synced live with Supabase."
        actions={
          <>
            <ImportButton
              existingCount={rows.length}
              onImported={(inserted, mode) => {
                setRows((rs) => (mode === 'replace' ? inserted : [...inserted, ...rs]))
              }}
            />
            <Button variant="secondary" size="sm"><Download size={14} /> Export</Button>
            <Button size="sm" onClick={addRow}><Plus size={14} /> Add row</Button>
          </>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search objectives, owners, squads…" className="pl-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{filtered.length} of {rows.length}</div>
      </div>

      <Card className="overflow-hidden">
        {status === 'loading' ? (
          <LoadingBlock label="Loading initiatives…" />
        ) : status === 'error' ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={rows.length === 0 ? 'No initiatives yet' : 'No matches'}
            description={rows.length === 0 ? 'Add your first initiative to start tracking.' : 'Try a different search or clear the filter.'}
            action={rows.length === 0
              ? <Button size="sm" onClick={addRow}><Plus size={14} /> Add row</Button>
              : <Button size="sm" variant="secondary" onClick={() => setQ('')}>Clear</Button>}
          />
        ) : (
          <Table>
            <THead><TR className="hover:bg-transparent">{COLS.map((c) => <TH key={c}>{c}</TH>)}</TR></THead>
            <TBody>
              {filtered.map((row) => (
                <MetricRow
                  key={row.id}
                  row={row}
                  editing={editingId === row.id}
                  onChange={updateCell}
                  onEdit={toggleEdit}
                  onDelete={removeRow}
                />
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  )
}
