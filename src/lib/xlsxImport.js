import * as XLSX from 'xlsx'

const HEADER_ALIASES = {
  objective: ['objective (short name)', 'objective', 'objective short name'],
  initiative: ['initiative', 'initiatives'],
  squad: ['squads/ wing', 'squads / wing', 'squad/wing', 'squads', 'squad', 'wing'],
  metric: ['success metric', 'metric', 'kpi'],
  baseline: ['baseline'],
  target: ['target', 'goal'],
  delivery: ['delivery date', 'delivery', 'due date'],
  followUp: ['follow up date', 'follow-up date', 'followup date', 'follow up'],
  achieved: ['achieved', 'status'],
  owner: ['owner', 'owners'],
}

const normalize = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

function detectHeaderRow(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false })
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const cells = rows[i].map(normalize)
    if (cells.some((c) => HEADER_ALIASES.objective.includes(c))) return { headerIndex: i, rows }
  }
  return { headerIndex: -1, rows }
}

function toIso(v) {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(s)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

const validAchieved = (v) => {
  const s = normalize(v)
  if (['yes', 'achieved'].includes(s)) return 'Achieved'
  if (['no', 'missed'].includes(s)) return 'Missed'
  if (['at risk', 'risk'].includes(s)) return 'At risk'
  if (['on track', 'ontrack'].includes(s)) return 'On track'
  if (['exceeded'].includes(s)) return 'Achieved'
  return v ? 'On track' : ''
}

export async function parseMetricsWorkbook(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { cellDates: true })
  const collected = []
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name]
    const { headerIndex, rows } = detectHeaderRow(sheet)
    if (headerIndex < 0) continue
    const headers = rows[headerIndex].map(normalize)
    const colIndex = {}
    for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
      colIndex[key] = headers.findIndex((h) => aliases.includes(h))
    }
    for (let r = headerIndex + 1; r < rows.length; r++) {
      const row = rows[r]
      const get = (k) => (colIndex[k] >= 0 ? row[colIndex[k]] : '')
      const objective = String(get('objective') ?? '').trim()
      const initiative = String(get('initiative') ?? '').trim()
      if (!objective && !initiative) continue
      collected.push({
        objective,
        initiative,
        squad: String(get('squad') ?? '').trim(),
        metric: String(get('metric') ?? '').trim(),
        baseline: String(get('baseline') ?? '').trim(),
        target: String(get('target') ?? '').trim(),
        delivery: toIso(get('delivery')),
        followUp: toIso(get('followUp')),
        achieved: validAchieved(get('achieved')),
        owner: String(get('owner') ?? '').trim(),
      })
    }
  }
  return collected
}
