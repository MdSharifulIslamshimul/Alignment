import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function AddRowInline({ weekLabel, onAdd }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('priority')
  const [item, setItem] = useState('')
  const [owner, setOwner] = useState('')
  const itemRef = useRef(null)

  const start = () => {
    setOpen(true); setKind('priority'); setItem(''); setOwner('')
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
        className="w-full inline-flex items-center gap-2 px-4 py-3 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-label={`Add an item to ${weekLabel}`}
      >
        <Plus size={14} strokeWidth={2.2} />
        <span>Add</span>
      </button>
    )
  }

  return (
    <div className="px-3 py-2.5 border-t border-border">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full bg-muted p-0.5" role="tablist" aria-label="Item type">
          {[
            { k: 'priority', label: 'Follow Up' },
            { k: 'blocker', label: 'Blocker' },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              role="tab"
              aria-selected={kind === o.k}
              onClick={() => setKind(o.k)}
              className={cn(
                'px-3 h-7 text-[11px] font-medium rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                kind === o.k
                  ? (o.k === 'blocker' ? 'bg-red-600/10 text-red-700 shadow-sm' : 'bg-card text-foreground shadow-sm')
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
          placeholder={kind === 'blocker' ? 'What is blocked' : 'New follow-up'}
          className="flex-1 h-8"
          aria-label={kind === 'blocker' ? 'Describe blocker' : 'Describe follow-up'}
        />
        <Input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder="Owner"
          className="h-8 w-[140px]"
          aria-label="Owner"
        />
        <button
          type="button"
          onClick={cancel}
          className="text-xs font-medium text-muted-foreground hover:text-foreground rounded-md px-2 h-8 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
