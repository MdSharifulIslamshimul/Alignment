import { useRef, useState } from 'react'
import { Upload, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseCadenceWorkbook } from '@/lib/xlsxImportCadence'
import { bulkInsertFollowUps } from '@/lib/api'

export function ImportCadenceButton({ onImported }) {
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const pick = () => { setError(null); inputRef.current?.click() }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (/\.pdf$/i.test(file.name)) {
      setError('PDF import isn’t supported yet. Please export to Excel (.xlsx) or CSV.')
      setPreview([]); setOpen(true); return
    }
    try {
      const rows = await parseCadenceWorkbook(file)
      if (rows.length === 0) {
        setError('No rows detected. Include a header row like "Top Priorities / Follow Up | Owner | Status | Remarks".')
      }
      setPreview(rows); setOpen(true)
    } catch (err) {
      setError(err?.message || 'Failed to parse file'); setPreview([]); setOpen(true)
    }
  }

  const confirm = async () => {
    setBusy(true); setError(null)
    try {
      const inserted = await bulkInsertFollowUps(preview)
      setOpen(false); setPreview([])
      onImported?.(inserted)
    } catch (err) {
      setError(err?.message || 'Import failed')
    } finally { setBusy(false) }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.pdf" onChange={onFile} className="hidden" />
      <Button variant="secondary" size="sm" onClick={pick}><Upload size={14} /> Bulk upload</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !busy && setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight">Bulk upload</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Detected <span className="font-medium text-foreground">{preview.length}</span> row{preview.length === 1 ? '' : 's'}. Rows append to the weekly list.
                </p>
              </div>
              <button onClick={() => setOpen(false)} disabled={busy} className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 disabled:opacity-50" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-56 overflow-auto border border-border rounded-lg mb-4">
              {preview.length === 0 ? (
                <div className="text-xs text-muted-foreground px-3 py-6 text-center">Excel format: rows under a "W##: Mon d-d" header, columns "Top Priorities / Follow Up | Owner | Status | Remarks".</div>
              ) : (
                <ul className="text-xs divide-y divide-border">
                  {preview.slice(0, 8).map((p, i) => (
                    <li key={i} className="px-3 py-2 flex items-center gap-2">
                      <span className={p.kind === 'blocker' ? 'text-red-600 font-medium' : 'text-muted-foreground'}>{p.kind === 'blocker' ? 'BLOCKER' : 'FOLLOW UP'}</span>
                      <span className="truncate flex-1">{p.item}</span>
                      <span className="text-muted-foreground">{p.owner || '—'}</span>
                      <span className="text-muted-foreground">{p.weekLabel || 'Unscheduled'}</span>
                    </li>
                  ))}
                  {preview.length > 8 && (<li className="px-3 py-2 text-muted-foreground text-center">…and {preview.length - 8} more</li>)}
                </ul>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-xs">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
              <Button size="sm" onClick={confirm} disabled={busy || preview.length === 0}>
                {busy ? 'Importing…' : (<><CheckCircle2 size={14} /> Import {preview.length}</>)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
