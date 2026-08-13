import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { suggestedWeekOptions, weekLabelFromDate } from '@/lib/week'

const blank = () => ({ item: '', owner: '', weekLabel: weekLabelFromDate(), statusNote: '', status: 'open' })

export function AddFollowUpForm({ onAdd, defaultWeek }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => ({ ...blank(), weekLabel: defaultWeek || weekLabelFromDate() }))
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.item.trim()) return
    onAdd({ ...form })
    setForm({ ...blank(), weekLabel: form.weekLabel })
    setOpen(false)
  }
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Add priority</Button>
  return (
    <Card className="p-4 mb-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-5"><Label className="text-xs">Top priority / follow up</Label><Input value={form.item} onChange={set('item')} placeholder="Ship the thing…" autoFocus /></div>
        <div className="md:col-span-2"><Label className="text-xs">Owner</Label><Input value={form.owner} onChange={set('owner')} /></div>
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
      </form>
    </Card>
  )
}
