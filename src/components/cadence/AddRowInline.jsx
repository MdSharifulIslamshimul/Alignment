import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AddRowInline({ weekLabel, onAdd }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('priority')
  const [item, setItem] = useState('')
  const [owner, setOwner] = useState('')
  const itemRef = useRef(null)

  const start = () => {
    setOpen(true)
    setKind('priority'); setItem(''); setOwner('')
    setTimeout(() => itemRef.current?.focus(), 0)
  }
  const submit = () => {
    if (!item.trim()) return
    onAdd({ item: item.trim(), owner: owner.trim(), kind, weekLabel, status: 'open', statusNote: '' })
    setItem(''); setOwner('')
    setTimeout(() => itemRef.current?.focus(), 0)
  }
  const cancel = () => setOpen(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-200"
      >
        <Plus size={14} /> Add follow-up or blocker
      </button>
    )
  }

  return (
    <div className="px-3 py-2 bg-muted/30 border-t border-border">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-input p-0.5 bg-card">
          {[
            { k: 'priority', label: 'Follow Up' },
            { k: 'blocker', label: 'Blocker' },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setKind(o.k)}
              className={cn(
                'px-2.5 h-7 text-xs font-medium rounded-md transition-colors duration-200',
                kind === o.k
                  ? (o.k === 'blocker' ? 'bg-red-100 text-red-700' : 'bg-secondary text-foreground')
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <Input
          ref={itemRef}
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder={kind === 'blocker' ? 'What is blocked…' : 'Describe the follow-up…'}
          className="flex-1 h-8"
        />
        <Input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder="Owner"
          className="h-8 w-[140px]"
        />
        <Button size="sm" onClick={submit}>Add</Button>
        <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
      </div>
    </div>
  )
}
