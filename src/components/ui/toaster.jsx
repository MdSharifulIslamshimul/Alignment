import { useEffect, useState } from 'react'
import { Undo2, Check } from 'lucide-react'

let queue = []
let listeners = []
let seq = 1

function emit() {
  for (const fn of listeners) fn([...queue])
}

export function toast({ message, action, duration = 5000 }) {
  const id = seq++
  const item = { id, message, action, duration }
  queue = [...queue, item]
  emit()
  if (duration > 0) setTimeout(() => dismiss(id), duration)
  return id
}
export function dismiss(id) {
  queue = queue.filter((t) => t.id !== id)
  emit()
}

export function Toaster() {
  const [items, setItems] = useState([])
  useEffect(() => {
    listeners.push(setItems)
    return () => { listeners = listeners.filter((l) => l !== setItems) }
  }, [])
  if (items.length === 0) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl bg-foreground text-background px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.16)] animate-fade-in"
        >
          <Check size={14} className="opacity-60" />
          <span className="text-[13px] font-medium">{t.message}</span>
          {t.action && (
            <button
              onClick={() => { t.action.onClick(); dismiss(t.id) }}
              className="ml-1 inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-md px-2 py-1 hover:bg-white/10 transition-colors duration-200"
            >
              <Undo2 size={12} /> {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
