import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { suggestedWeekOptions, weekLabelFromDate } from '@/lib/week'

const blank = () => ({ item: '', owner: '', weekLabel: weekLabelFromDate(), statusNote: '', status: 'open', kind: 'priority' })

function TypeToggle({ value, onChange }) {
  const opts = [
    { key: 'priority', label: 'Priority' },
    { key: 'blocker', label: 'Blocker' },
  ]
  return (
    <div className="inline-flex rounded-lg border border-input p-0.5 bg-muted/40">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            'px-3 h-8 text-xs font-medium rounded-md transition-colors duration-200',
            value === o.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function AddFollowUpForm({ onAdd, defaultWeek }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => ({ ...blank(), weekLabel: defaultWeek || weekLabelFromDate() }))
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.item.trim()) return
    onAdd({ ...form })
    setForm({ ...blank(), weekLabel: form.weekLabel, kind: form.kind })
    setOpen(false)
  }
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Add priority</Button>

  return (
    <Card className="p-4 mb-4">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <TypeToggle value={form.kind} onChange={(k) => setForm((f) => ({ ...f, kind: k }))} />
          <div className="text-xs text-muted-foreground">
            {form.kind === 'blocker' ? 'Tagged as blocker in the week list.' : 'Tracked as a top priority for the week.'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <Label className="text-xs">{form.kind === 'blocker' ? 'What is blocked' : 'Top priority / follow up'}</Label>
            <Input value={form.item} onChange={set('item')} placeholder={form.kind === 'blocker' ? 'e.g. Google/YouTube Ads' : 'Ship the thing…'} autoFocus />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Owner</Label>
            <Input value={form.owner} onChange={set('owner')} />
          </div>
          <div className="md:col-span-3">
            <Label className="text-xs">Week</Label>
            <Select value={form.weekLabel} onChange={set('weekLabel')}>
              {suggestedWeekOptions().map((w) => <option key={w} value={w}>{w}</option>)}
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" size="sm">Add</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
