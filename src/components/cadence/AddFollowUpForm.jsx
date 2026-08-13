import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const BLANK = { item: '', owner: '', due: '', severity: 'medium', context: '' }

export function AddFollowUpForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.item.trim()) return
    onAdd({ ...form, id: `f_${Math.floor(performance.now() * 1000)}`, status: 'open' })
    setForm(BLANK)
    setOpen(false)
  }
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New follow-up</Button>
  return (
    <Card className="p-4 mb-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2"><Label className="text-xs">Item</Label><Input value={form.item} onChange={set('item')} placeholder="What needs to happen?" /></div>
        <div><Label className="text-xs">Owner</Label><Input value={form.owner} onChange={set('owner')} /></div>
        <div><Label className="text-xs">Due</Label><Input type="date" value={form.due} onChange={set('due')} /></div>
        <div>
          <Label className="text-xs">Severity</Label>
          <Select value={form.severity} onChange={set('severity')}>
            <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option>
          </Select>
        </div>
        <div className="flex gap-2"><Button type="submit" size="sm">Add</Button><Button type="button" size="sm" variant="ghost" onClick={() => { setForm(BLANK); setOpen(false) }}>Cancel</Button></div>
      </form>
    </Card>
  )
}
