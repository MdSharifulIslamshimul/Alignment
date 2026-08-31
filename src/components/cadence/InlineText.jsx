import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

function autoResize(el) {
 if (!el) return
 el.style.height = '0px'
 el.style.height = `${el.scrollHeight}px`
}

export function InlineText({ value, onCommit, placeholder = '—', className, textClassName, multiline = true }) {
 const [v, setV] = useState(value ?? '')
 const ref = useRef(null)

 useEffect(() => { setV(value ?? '') }, [value])
 useEffect(() => { if (multiline) autoResize(ref.current) }, [v, multiline])

 const commit = () => {
  const next = (v ?? '').trim()
  const prev = (value ?? '').trim()
  if (next !== prev) onCommit(next)
 }
 const onKey = (e) => {
  if (!multiline && e.key === 'Enter') { e.preventDefault(); ref.current?.blur() }
  if (multiline && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ref.current?.blur() }
  if (e.key === 'Escape') { setV(value ?? ''); ref.current?.blur() }
 }

 if (multiline) {
  return (
   <textarea
    ref={ref}
    value={v}
    onChange={(e) => setV(e.target.value)}
    onBlur={commit}
    onKeyDown={onKey}
    placeholder={placeholder}
    rows={1}
    className={cn(
     'block w-full bg-transparent placeholder:text-muted-foreground/50 focus:outline-none rounded-md px-2 py-1 border border-transparent hover:border-input focus:border-input transition-colors duration-200 resize-none leading-snug break-words whitespace-pre-wrap overflow-hidden',
     textClassName,
     className
    )}
   />
  )
 }
 return (
  <input
   ref={ref}
   value={v}
   onChange={(e) => setV(e.target.value)}
   onBlur={commit}
   onKeyDown={onKey}
   placeholder={placeholder}
   className={cn(
    'w-full bg-transparent placeholder:text-muted-foreground/50 focus:outline-none rounded-md px-2 py-1 border border-transparent hover:border-input focus:border-input transition-colors duration-200',
    textClassName,
    className
   )}
  />
 )
}
