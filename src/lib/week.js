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

export function suggestedWeekOptions(date = new Date(), { past = 12, future = 5 } = {}) {
  const opts = []
  for (let i = -past; i <= future; i++) {
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

export function mondayFromLabelSmart(label, today = new Date()) {
  if (!label) return null
  const m = label.match(/([A-Za-z]{3,})\s+(\d{1,2})/)
  if (!m) return null
  const monthName = m[1]
  const day = m[2]
  const currentYear = today.getFullYear()
  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + 35)
  const candidates = [currentYear - 1, currentYear, currentYear + 1]
    .map((y) => {
      const d = new Date(`${monthName} ${day} ${y}`)
      return isNaN(d.getTime()) ? null : mondayOf(d)
    })
    .filter(Boolean)
    .filter((d) => d <= cutoff)
  if (candidates.length === 0) return null
  candidates.sort((a, b) => Math.abs(today - a) - Math.abs(today - b))
  return candidates[0]
}

export function monthKeyFromDate(date) {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function quarterKeyFromDate(date) {
  if (!date) return null
  const q = Math.floor(date.getMonth() / 3) + 1
  return `${date.getFullYear()}-Q${q}`
}

export function formatMonthLabel(monthKey) {
  if (!monthKey) return ''
  const [y, m] = monthKey.split('-')
  const idx = parseInt(m, 10) - 1
  return `${MONTHS[idx]} ${y}`
}

export function formatQuarterLabel(quarterKey) {
  if (!quarterKey) return ''
  const [y, q] = quarterKey.split('-Q')
  const qi = parseInt(q, 10) - 1
  const startIdx = qi * 3
  const endIdx = startIdx + 2
  return `Q${q} ${y} · ${MONTHS[startIdx]}–${MONTHS[endIdx]}`
}

export function currentMonthKey(today = new Date()) {
  return monthKeyFromDate(today)
}

export function currentQuarterKey(today = new Date()) {
  return quarterKeyFromDate(today)
}
