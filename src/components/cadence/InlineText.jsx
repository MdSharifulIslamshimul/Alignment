import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function InlineText({ value, onCommit, placeholder = '—', className, textClassName, multiline = false }) {
  const [v, setV] = useState(value ?? '')
  const ref = useRef(null)

  useEffect(() => { setV(value ?? '') }, [value])

  const commit = () => {
    const next = (v ?? '').trim()
    const prev = (value ?? '').trim()
    if (next !== prev) onCommit(next)
  }

  const onKey = (e) => {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); ref.current?.blur() }
    if (e.key === 'Escape') { setV(value ?? ''); ref.current?.blur() }
  }

  const Tag = multiline ? 'textarea' : 'input'
  return (
    <Tag
      ref={ref}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={onKey}
      placeholder={placeholder}
      rows={multiline ? 2 : undefined}
      className={cn(
        'w-full bg-transparent placeholder:text-muted-foreground/50 focus:outline-none rounded-md px-2 py-1 border border-transparent hover:border-input focus:border-input transition-colors duration-200 resize-none',
        textClassName,
        className
      )}
    />
  )
}
