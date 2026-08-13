import { useMemo, useState } from 'react'
import { Plus, Search, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricRow } from '@/components/metrics/MetricRow'
import { initialMetrics } from '@/lib/mockData'

const COLS = [
  'Objective (Short Name)', 'Initiative', 'Squads / Wing', 'Success Metric',
  'Baseline', 'Target', 'Delivery Date', 'Follow Up Date', 'Achieved', 'Owner', '',
]

function makeBlank() {
  return {
    id: `m_${Math.floor(performance.now() * 1000)}`,
    objective: '', initiative: '', squad: '', metric: '',
    baseline: '', target: '', delivery: '', followUp: '', achieved: 'On track', owner: '',
  }
}

export default function OperatingMetricsReview() {
  const [rows, setRows] = useState(initialMetrics)
  const [editingId, setEditingId] = useState(null)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(s)))
  }, [rows, q])

  const updateCell = (id, key, value) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  const toggleEdit = (id) => setEditingId((cur) => (cur === id ? null : id))
  const removeRow = (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id))
    if (editingId === id) setEditingId(null)
  }
  const addRow = () => {
    const r = makeBlank()
    setRows((rs) => [r, ...rs])
    setEditingId(r.id)
  }

  return (
    <>
      <PageHeader
        title="Operating Metrics Review"
        description="Objectives, initiatives, and success metrics — editable inline."
        actions={
          <>
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
        {filtered.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={rows.length === 0 ? 'No initiatives yet' : 'No matches'}
            description={rows.length === 0 ? 'Add your first initiative to start tracking.' : 'Try a different search or clear the filter.'}
            action={rows.length === 0 ? <Button size="sm" onClick={addRow}><Plus size={14} /> Add row</Button> : <Button size="sm" variant="secondary" onClick={() => setQ('')}>Clear</Button>}
          />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">{COLS.map((c) => <TH key={c}>{c}</TH>)}</TR>
            </THead>
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
