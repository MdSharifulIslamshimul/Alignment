import { cn } from '@/lib/utils'

const tones = {
 default: 'bg-secondary text-secondary-foreground',
 outline: 'border border-border text-foreground',
 critical: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
 high: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
 medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
 low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
 positive: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
 negative: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
 neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
 mixed: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}

export function Badge({ className, tone = 'default', ...props }) {
 return (
  <span
   className={cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    tones[tone] ?? tones.default,
    className
   )}
   {...props}
  />
 )
}
