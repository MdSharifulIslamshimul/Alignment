import { supabase, TABLE } from './supabase'

const toDbMetric = (m) => ({
  objective: m.objective ?? '',
  initiative: m.initiative ?? '',
  squad: m.squad ?? '',
  metric: m.metric ?? '',
  baseline: m.baseline ?? '',
  target: m.target ?? '',
  delivery: m.delivery || null,
  follow_up: m.followUp || null,
  achieved: m.achieved ?? 'On track',
  owner: m.owner ?? '',
})
const fromDbMetric = (r) => ({
  id: r.id,
  objective: r.objective ?? '',
  initiative: r.initiative ?? '',
  squad: r.squad ?? '',
  metric: r.metric ?? '',
  baseline: r.baseline ?? '',
  target: r.target ?? '',
  delivery: r.delivery ?? '',
  followUp: r.follow_up ?? '',
  achieved: r.achieved ?? '',
  owner: r.owner ?? '',
})

export async function listMetrics() {
  const { data, error } = await supabase.from(TABLE.metrics).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(fromDbMetric)
}
export async function insertMetric(row) {
  const { data, error } = await supabase.from(TABLE.metrics).insert(toDbMetric(row)).select().single()
  if (error) throw error
  return fromDbMetric(data)
}
export async function updateMetric(id, patch) {
  const payload = toDbMetric(patch)
  const { data, error } = await supabase.from(TABLE.metrics).update(payload).eq('id', id).select().single()
  if (error) throw error
  return fromDbMetric(data)
}
export async function deleteMetric(id) {
  const { error } = await supabase.from(TABLE.metrics).delete().eq('id', id)
  if (error) throw error
}

export async function bulkInsertMetrics(rows) {
  if (!rows?.length) return []
  const payload = rows.map(toDbMetric)
  const { data, error } = await supabase.from(TABLE.metrics).insert(payload).select()
  if (error) throw error
  return (data || []).map(fromDbMetric)
}

export async function deleteAllMetrics() {
  const { error } = await supabase.from(TABLE.metrics).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

const toDbFollowUp = (f) => ({
  item: f.item ?? '',
  owner: f.owner ?? '',
  due: f.due || null,
  severity: f.severity ?? 'medium',
  status: f.status ?? 'open',
  context: f.context ?? '',
  week_label: f.weekLabel ?? null,
  status_note: f.statusNote ?? '',
  kind: f.kind ?? 'priority',
})
const fromDbFollowUp = (r) => ({
  id: r.id,
  item: r.item ?? '',
  owner: r.owner ?? '',
  due: r.due ?? '',
  severity: r.severity ?? 'medium',
  status: r.status ?? 'open',
  context: r.context ?? '',
  weekLabel: r.week_label ?? '',
  statusNote: r.status_note ?? '',
  kind: r.kind ?? 'priority',
})

export async function listFollowUps() {
  const { data, error } = await supabase.from(TABLE.followUps).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(fromDbFollowUp)
}
export async function insertFollowUp(row) {
  const { data, error } = await supabase.from(TABLE.followUps).insert(toDbFollowUp(row)).select().single()
  if (error) throw error
  return fromDbFollowUp(data)
}
export async function updateFollowUp(id, patch) {
  const { data, error } = await supabase.from(TABLE.followUps).update(patch).eq('id', id).select().single()
  if (error) throw error
  return fromDbFollowUp(data)
}
export async function deleteFollowUp(id) {
  const { error } = await supabase.from(TABLE.followUps).delete().eq('id', id)
  if (error) throw error
}

const toDbSignal = (s) => ({
  observation: s.observation ?? '',
  kind: s.kind ?? 'problem',
  theme: s.theme ?? '',
  status: s.status ?? 'new',
  note: s.note ?? '',
  source: s.source ?? '',
})
const fromDbSignal = (r) => ({
  id: r.id,
  observation: r.observation ?? '',
  kind: r.kind ?? 'problem',
  theme: r.theme ?? '',
  status: r.status ?? 'new',
  note: r.note ?? '',
  source: r.source ?? '',
  background: r.background ?? '',
  problem: r.problem ?? '',
  goal: r.goal ?? '',
  whyNow: r.why_now ?? '',
  positioning: r.positioning ?? '',
  risks: r.risks ?? '',
  successMetrics: r.success_metrics ?? '',
  qnaLedger: Array.isArray(r.qna_ledger) ? r.qna_ledger : [],
  actionList: Array.isArray(r.action_list) ? r.action_list : [],
  imageUrls: Array.isArray(r.image_urls) ? r.image_urls : [],
})

const SIGNAL_FIELD_TO_DB = {
  observation: 'observation', kind: 'kind', theme: 'theme', status: 'status',
  note: 'note', source: 'source',
  background: 'background', problem: 'problem', goal: 'goal',
  whyNow: 'why_now', positioning: 'positioning', risks: 'risks',
  successMetrics: 'success_metrics',
  qnaLedger: 'qna_ledger', actionList: 'action_list', imageUrls: 'image_urls',
}

export async function getSignal(id) {
  const { data, error } = await supabase.from(TABLE.signals).select('*').eq('id', id).single()
  if (error) throw error
  return fromDbSignal(data)
}

export async function updateSignalFields(id, patch) {
  const dbPatch = {}
  for (const [key, val] of Object.entries(patch)) {
    const dbKey = SIGNAL_FIELD_TO_DB[key]
    if (dbKey) dbPatch[dbKey] = val
  }
  const { data, error } = await supabase.from(TABLE.signals).update(dbPatch).eq('id', id).select().single()
  if (error) throw error
  return fromDbSignal(data)
}

const IMAGES_BUCKET = 'alignment-signal-images'
export async function uploadSignalImage(signalId, file) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${signalId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error: upErr } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function listSignals() {
  const { data, error } = await supabase.from(TABLE.signals).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(fromDbSignal)
}
export async function insertSignal(row) {
  const { data, error } = await supabase.from(TABLE.signals).insert(toDbSignal(row)).select().single()
  if (error) throw error
  return fromDbSignal(data)
}
export async function updateSignal(id, patch) {
  const { data, error } = await supabase.from(TABLE.signals).update(patch).eq('id', id).select().single()
  if (error) throw error
  return fromDbSignal(data)
}
export async function deleteSignal(id) {
  const { error } = await supabase.from(TABLE.signals).delete().eq('id', id)
  if (error) throw error
}

const fromDbBlocker = (r) => ({
  id: r.id,
  title: r.title ?? '',
  impact: r.impact ?? '',
  owner: r.owner ?? '',
  severity: r.severity ?? 'medium',
  since: r.since ?? '',
})
const toDbBlocker = (b) => ({
  title: b.title ?? '',
  impact: b.impact ?? '',
  owner: b.owner ?? '',
  severity: b.severity ?? 'medium',
  since: b.since || null,
})

export async function listBlockers() {
  const { data, error } = await supabase.from(TABLE.blockers).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(fromDbBlocker)
}
export async function insertBlocker(row) {
  const { data, error } = await supabase.from(TABLE.blockers).insert(toDbBlocker(row)).select().single()
  if (error) throw error
  return fromDbBlocker(data)
}
export async function deleteBlocker(id) {
  const { error } = await supabase.from(TABLE.blockers).delete().eq('id', id)
  if (error) throw error
}
