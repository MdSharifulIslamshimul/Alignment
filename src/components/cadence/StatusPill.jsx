import { cn } from '@/lib/utils'

const LABEL = { open: 'Open', in_progress: 'In progress', done: 'Done' }
const STYLE = {
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-50 text-blue-700',
  done: 'bg-green-50 text-green-700',
}

export function StatusPill({ status, onCycle }) {
  return (
    <button
      onClick={onCycle}
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200', STYLE[status])}
    >
      {LABEL[status]}
    </button>
  )
}
