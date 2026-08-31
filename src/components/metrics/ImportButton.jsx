import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportDialog } from './ImportDialog'
import { parseMetricsWorkbook } from '@/lib/xlsxImport'
import { bulkInsertMetrics, deleteAllMetrics } from '@/lib/api'

export function ImportButton({ existingCount, onImported }) {
 const inputRef = useRef(null)
 const [open, setOpen] = useState(false)
 const [preview, setPreview] = useState([])
 const [mode, setMode] = useState('append')
 const [busy, setBusy] = useState(false)
 const [error, setError] = useState(null)

 const pickFile = () => { setError(null); inputRef.current?.click() }

 const onFile = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  try {
   const rows = await parseMetricsWorkbook(file)
   if (rows.length === 0) {
    setError('No rows detected. Make sure the sheet has an "Objective (Short Name)" header row.')
    setPreview([]); setOpen(true); return
   }
   setPreview(rows); setError(null); setOpen(true)
  } catch (err) {
   setError(err?.message || 'Failed to parse file'); setPreview([]); setOpen(true)
  }
 }

 const confirm = async () => {
  setBusy(true); setError(null)
  try {
   if (mode === 'replace') await deleteAllMetrics()
   const inserted = await bulkInsertMetrics(preview)
   setOpen(false); setPreview([])
   onImported?.(inserted, mode)
  } catch (err) {
   setError(err?.message || 'Import failed')
  } finally {
   setBusy(false)
  }
 }

 return (
  <>
   <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" />
   <Button variant="secondary" size="sm" onClick={pickFile}><Upload size={14} /> Import xlsx</Button>
   <ImportDialog
    open={open}
    onClose={() => !busy && setOpen(false)}
    preview={preview}
    existingCount={existingCount}
    mode={mode}
    onModeChange={setMode}
    onConfirm={confirm}
    busy={busy}
    error={error}
   />
  </>
 )
}
