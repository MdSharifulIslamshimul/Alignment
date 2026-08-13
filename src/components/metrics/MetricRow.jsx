import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TR, TD } from '@/components/ui/table'
import { AchievedBadge } from './AchievedBadge'

const cellInput = 'h-8 px-2 text-sm bg-transparent border-transparent hover:border-input focus:border-input rounded-md'
const ACHIEVED_OPTIONS = ['On track', 'At risk', 'Achieved', 'Missed']

export function MetricRow({ row, editing, onChange, onEdit, onDelete }) {
  const F = (key, type = 'text') => (
    <Input
      type={type}
      value={row[key] ?? ''}
      onChange={(e) => onChange(row.id, key, e.target.value)}
      className={cellInput}
    />
  )
  return (
    <TR>
      <TD className="min-w-[160px]">{editing ? F('objective') : <span className="font-medium">{row.objective}</span>}</TD>
      <TD className="min-w-[180px]">{editing ? F('initiative') : row.initiative}</TD>
      <TD className="min-w-[160px] text-muted-foreground">{editing ? F('squad') : row.squad}</TD>
      <TD className="min-w-[180px]">{editing ? F('metric') : row.metric}</TD>
      <TD className="min-w-[100px] tabular-nums">{editing ? F('baseline') : row.baseline}</TD>
      <TD className="min-w-[100px] tabular-nums">{editing ? F('target') : row.target}</TD>
      <TD className="min-w-[140px] tabular-nums">{editing ? F('delivery', 'date') : row.delivery}</TD>
      <TD className="min-w-[140px] tabular-nums">{editing ? F('followUp', 'date') : row.followUp}</TD>
      <TD className="min-w-[140px]">
        {editing ? (
          <Select value={row.achieved || ''} onChange={(e) => onChange(row.id, 'achieved', e.target.value)} className="h-8">
            <option value="">—</option>
            {ACHIEVED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        ) : (
          <AchievedBadge value={row.achieved} />
        )}
      </TD>
      <TD className="min-w-[140px]">{editing ? F('owner') : row.owner}</TD>
      <TD className="w-[80px] text-right">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => onEdit(row.id)} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
            {editing ? 'Done' : 'Edit'}
          </button>
          <button onClick={() => onDelete(row.id)} className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200" aria-label="Delete row">
            <Trash2 size={14} />
          </button>
        </div>
      </TD>
    </TR>
  )
}
