import * as XLSX from 'xlsx'

const normalize = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

const HEADER_ALIASES = {
  item: ['top priorities / follow up', 'top priorities/follow up', 'priorities', 'priority', 'follow up', 'top priorities', 'item', 'task'],
  owner: ['owner', 'owners', 'assignee'],
  status: ['status'],
  remarks: ['remarks', 'notes', 'note', 'status note', 'comments'],
  week: ['week', 'week label'],
  kind: ['type', 'kind'],
}
const WEEK_RE = /^\s*(?:W\s*\d+\s*[:.\-]\s*)?[A-Za-z]{3,}\s+\d{1,2}\s*[-–]\s*\d{1,2}/

function detectHeaderIndex(rows) {
  return rows.findIndex((row) => row.map(normalize).some((c) => HEADER_ALIASES.item.includes(c)))
}
function looksLikeWeekLabel(cells) {
  const first = String(cells.find((c) => String(c ?? '').trim() !== '') ?? '').trim()
  return WEEK_RE.test(first) ? first : null
}
const mapStatus = (v) => {
  const s = normalize(v)
  if (['done', 'complete', 'completed', 'closed', 'achieved'].includes(s)) return 'done'
  if (['in progress', 'inprogress', 'ongoing', 'started'].includes(s)) return 'in_progress'
  if (['open', 'not started', 'todo', 'pending'].includes(s)) return 'open'
  return v ? 'in_progress' : 'open'
}
const mapKind = (v) => (normalize(v) === 'blocker' ? 'blocker' : 'priority')

function buildColIndex(headers) {
  const idx = {}
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    idx[key] = headers.findIndex((h) => aliases.includes(h))
  }
  return idx
}

export async function parseCadenceWorkbook(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { cellDates: true })
  const out = []
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false })
    let currentWeek = null
    let colIndex = null
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]
      const cellsNorm = row.map(normalize)
      const weekLabel = looksLikeWeekLabel(row)
      if (weekLabel) { currentWeek = weekLabel; colIndex = null; continue }
      if (cellsNorm.some((c) => HEADER_ALIASES.item.includes(c))) {
        colIndex = buildColIndex(cellsNorm); continue
      }
      if (!colIndex) {
        const auto = detectHeaderIndex(rows.slice(r))
        if (auto === 0) { colIndex = buildColIndex(cellsNorm); continue }
        continue
      }
      const get = (k) => (colIndex[k] >= 0 ? row[colIndex[k]] : '')
      const item = String(get('item') ?? '').trim()
      if (!item) continue
      const explicitWeek = String(get('week') ?? '').trim()
      out.push({
        item,
        owner: String(get('owner') ?? '').trim(),
        status: mapStatus(get('status')),
        statusNote: String(get('remarks') ?? '').trim(),
        kind: mapKind(get('kind')),
        weekLabel: explicitWeek || currentWeek || null,
      })
    }
  }
  return out
}
