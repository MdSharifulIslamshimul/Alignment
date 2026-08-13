const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7)
}

export function mondayOf(date) {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - (day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

export function weekLabelFromDate(date = new Date()) {
  const monday = mondayOf(date)
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4)
  const week = isoWeek(monday)
  const sameMonth = monday.getMonth() === friday.getMonth()
  const left = `${MONTHS[monday.getMonth()]} ${monday.getDate()}`
  const right = sameMonth ? `${friday.getDate()}` : `${MONTHS[friday.getMonth()]} ${friday.getDate()}`
  return `W${week}: ${left}-${right}`
}

export function nextWeekLabel(date = new Date()) {
  const d = new Date(date); d.setDate(d.getDate() + 7)
  return weekLabelFromDate(d)
}

export function suggestedWeekOptions(date = new Date()) {
  const opts = []
  for (let i = -1; i <= 4; i++) {
    const d = new Date(date); d.setDate(d.getDate() + i * 7)
    opts.push(weekLabelFromDate(d))
  }
  return Array.from(new Set(opts))
}

export function mondayFromLabel(label, refYear = new Date().getFullYear()) {
  if (!label) return null
  const m = label.match(/([A-Za-z]{3,})\s+(\d{1,2})/)
  if (!m) return null
  const d = new Date(`${m[1]} ${m[2]} ${refYear}`)
  return isNaN(d.getTime()) ? null : mondayOf(d)
}

export function nextLabelAfter(label) {
  const monday = mondayFromLabel(label)
  if (!monday) return null
  const next = new Date(monday); next.setDate(next.getDate() + 7)
  return weekLabelFromDate(next)
}
