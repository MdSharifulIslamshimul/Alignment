import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function AddRowInline({ weekOptions, defaultWeek, onAdd }) {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState('')
  const [owner, setOwner] = useState('')
  const [week, setWeek] = useState(defaultWeek ?? '')
  const itemRef = useRef(null)
  const hasPicker = Array.isArray(weekOptions) && weekOptions.length > 0

  useEffect(() => { setWeek(defaultWeek ?? '') }, [defaultWeek])

  const start = () => {
    setOpen(true)
    setItem(''); setOwner('')
    setWeek(defaultWeek ?? '')
    setTimeout(() => itemRef.current?.focus(), 0)
  }
  const submit = () => {
    if (!item.trim()) return
    onAdd({
      item: item.trim(),
      owner: owner.trim(),
      weekLabel: week || '',
      status: 'not_started',
      statusNote: '',
      kind: 'priority',
    })
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
        <Plus size={14} /> Add follow-up
      </button>
    )
  }

  return (
    <div className="px-3 py-2 bg-muted/30 border-t border-border">
      <div className="flex items-center gap-2">
        <Input
          ref={itemRef}
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder="Describe the follow-up…"
          className="flex-1 h-8"
        />
        <Input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder="Owner"
          className="h-8 w-[120px]"
        />
        {hasPicker && (
          <Select
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="h-8 w-[92px] text-xs"
            aria-label="Target week"
            title="Target week"
          >
            {weekOptions.map((w) => {
              const code = w.match(/^(W\d+)/)?.[1] || w.slice(0, 12)
              return <option key={w} value={w}>{code}</option>
            })}
          </Select>
        )}
        <Button size="sm" onClick={submit}>Add</Button>
        <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
      </div>
    </div>
  )
}
