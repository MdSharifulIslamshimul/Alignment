import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ParkingLot({ items, onAdd, onResolve }) {
  const [title, setTitle] = useState('')
  const [impact, setImpact] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), impact: impact.trim(), severity: 'medium', owner: '' })
    setTitle(''); setImpact('')
  }
  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[16px] font-semibold tracking-tight">Parking Lot & Blockers</h2>
        <span className="text-xs text-muted-foreground">{items.length} active</span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground mb-4">Nothing parked. Squads are unblocked.</div>
      ) : (
        <ul className="mb-4 space-y-2.5">
          {items.map((b) => (
            <li key={b.id} className="flex items-start gap-3 group">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm"><span className="font-medium">{b.title}</span>{b.impact ? <span className="text-muted-foreground"> — {b.impact}</span> : null}</div>
              </div>
              <button onClick={() => onResolve(b.id)} className="opacity-0 group-hover:opacity-100 h-6 w-6 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200" aria-label="Resolve">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center pt-3 border-t border-border">
        <Input className="md:col-span-4" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blocker or topic" />
        <Input className="md:col-span-6" value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="Why it's blocking / where it needs unblocking" />
        <Button type="submit" size="sm" className="md:col-span-2"><Plus size={14} /> Add</Button>
      </form>
    </Card>
  )
}
