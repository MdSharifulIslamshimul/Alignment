import { mondayFromLabelSmart, mondayOf } from './week'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// Tailwind classes per week (relative to today), so consecutive weeks look distinct
// and current-week pops. Anything past ±4 weeks collapses into slate.
export function weekChipClass(weekLabel, today = new Date()) {
 const wm = mondayFromLabelSmart(weekLabel, today)?.getTime()
 if (!wm) {
  return 'text-slate-700 bg-slate-100 ring-slate-200/70 dark:text-slate-300 dark:bg-slate-800/50 dark:ring-slate-700/70'
 }
 const cm = mondayOf(today).getTime()
 const delta = Math.round((wm - cm) / WEEK_MS)
 if (delta <= -4) return 'text-slate-700 bg-slate-100 ring-slate-200/70 dark:text-slate-300 dark:bg-slate-800/50 dark:ring-slate-700/70'
 if (delta === -3) return 'text-rose-700 bg-rose-50 ring-rose-200/70 dark:text-rose-200 dark:bg-rose-500/10 dark:ring-rose-500/30'
 if (delta === -2) return 'text-orange-700 bg-orange-50 ring-orange-200/70 dark:text-orange-200 dark:bg-orange-500/10 dark:ring-orange-500/30'
 if (delta === -1) return 'text-amber-700 bg-amber-50 ring-amber-200/70 dark:text-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30'
 if (delta === 0)  return 'text-indigo-800 bg-indigo-100 ring-indigo-300/70 dark:text-indigo-100 dark:bg-indigo-500/20 dark:ring-indigo-400/40'
 if (delta === 1)  return 'text-emerald-700 bg-emerald-50 ring-emerald-200/70 dark:text-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30'
 if (delta === 2)  return 'text-teal-700 bg-teal-50 ring-teal-200/70 dark:text-teal-200 dark:bg-teal-500/10 dark:ring-teal-500/30'
 if (delta === 3)  return 'text-sky-700 bg-sky-50 ring-sky-200/70 dark:text-sky-200 dark:bg-sky-500/10 dark:ring-sky-500/30'
 return 'text-violet-700 bg-violet-50 ring-violet-200/70 dark:text-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/30'
}

export function weekRelativeLabel(weekLabel, today = new Date()) {
 const wm = mondayFromLabelSmart(weekLabel, today)?.getTime()
 if (!wm) return ''
 const cm = mondayOf(today).getTime()
 const delta = Math.round((wm - cm) / WEEK_MS)
 if (delta === 0) return 'Current week'
 if (delta === 1) return 'Next week'
 if (delta === -1) return 'Last week'
 if (delta > 0) return `In ${delta} weeks`
 return `${Math.abs(delta)} weeks ago`
}
