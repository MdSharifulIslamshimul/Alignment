import { cn } from '@/lib/utils'

const LABEL = { open: 'Open', in_progress: 'In progress', done: 'Done' }
const NEXT = { open: 'in progress', in_progress: 'done', done: 'open' }
const STYLE = {
  open: 'text-muted-foreground bg-muted hover:bg-accent',
  in_progress: 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300',
  done: 'text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300',
}

export function StatusPill({ status, onCycle }) {
  return (
    <button
      onClick={onCycle}
      aria-label={`Status: ${LABEL[status]}. Click to change to ${NEXT[status]}`}
      className={cn(
        'inline-flex items-center rounded-full h-5 px-2 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        STYLE[status]
      )}
    >
      {LABEL[status]}
    </button>
  )
}
