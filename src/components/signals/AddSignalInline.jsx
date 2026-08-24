import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function AddSignalInline({ defaultTheme, defaultKind = 'problem', onAdd }) {
  const [open, setOpen] = useState(false)
  const [observation, setObservation] = useState('')
  const [kind, setKind] = useState(defaultKind)
  const [theme, setTheme] = useState(defaultTheme ?? '')
  const ref = useRef(null)

  useEffect(() => { setTheme(defaultTheme ?? '') }, [defaultTheme])

  const start = () => {
    setOpen(true)
    setObservation('')
    setKind(defaultKind)
    setTheme(defaultTheme ?? '')
    setTimeout(() => ref.current?.focus(), 0)
  }
  const submit = () => {
    if (!observation.trim()) return
    onAdd({ observation: observation.trim(), kind, theme: theme.trim(), status: 'new', note: '', source: '' })
    setObservation('')
    setTimeout(() => ref.current?.focus(), 0)
  }
  const cancel = () => setOpen(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-200"
      >
        <Plus size={14} /> Add signal
      </button>
    )
  }

  return (
    <div className="px-3 py-2 bg-muted/30 border-t border-border">
      <div className="flex items-center gap-2">
        <Input
          ref={ref}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder="What did you notice? A question or observation…"
          className="flex-1 h-8"
        />
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-8 w-[130px] text-xs"
          aria-label="Kind"
        >
          <option value="problem">Problem</option>
          <option value="opportunity">Opportunity</option>
        </Select>
        <Input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel() }}
          placeholder="Theme"
          className="h-8 w-[160px]"
        />
        <Button size="sm" onClick={submit}>Add</Button>
        <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
      </div>
    </div>
  )
}
