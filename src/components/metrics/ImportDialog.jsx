import { useEffect } from 'react'
import { X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImportDialog({ open, onClose, preview, existingCount, mode, onModeChange, onConfirm, busy, error }) {
 useEffect(() => {
  if (!open) return
  const onKey = (e) => e.key === 'Escape' && !busy && onClose()
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
 }, [open, busy, onClose])

 if (!open) return null
 const rowCount = preview?.length ?? 0

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !busy && onClose()}>
   <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
   <div
    className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6"
    onClick={(e) => e.stopPropagation()}
   >
    <div className="flex items-start justify-between mb-4">
     <div>
      <h2 className="text-[18px] font-semibold tracking-tight">Import metrics</h2>
      <p className="text-sm text-muted-foreground mt-0.5">
       Detected <span className="font-medium text-foreground">{rowCount}</span> rows in the file.
      </p>
     </div>
     <button onClick={onClose} disabled={busy} className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 disabled:opacity-50" aria-label="Close">
      <X size={16} />
     </button>
    </div>

    <div className="space-y-2 mb-5">
     <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors duration-200">
      <input type="radio" checked={mode === 'append'} onChange={() => onModeChange('append')} className="mt-1" />
      <div>
       <div className="text-sm font-medium">Append</div>
       <div className="text-xs text-muted-foreground">Keep {existingCount} existing rows, add {rowCount} new ones.</div>
      </div>
     </label>
     <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors duration-200">
      <input type="radio" checked={mode === 'replace'} onChange={() => onModeChange('replace')} className="mt-1" />
      <div>
       <div className="text-sm font-medium">Replace all</div>
       <div className="text-xs text-muted-foreground">Delete {existingCount} existing rows, then import {rowCount}. Cannot be undone.</div>
      </div>
     </label>
    </div>

    {error && (
     <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-xs">
      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
      <span>{error}</span>
     </div>
    )}

    <div className="flex items-center justify-end gap-2">
     <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
     <Button size="sm" onClick={onConfirm} disabled={busy || rowCount === 0}>
      {busy ? 'Importing…' : (<><CheckCircle2 size={14} /> Import {rowCount}</>)}
     </Button>
    </div>
   </div>
  </div>
 )
}
