export function Spinner({ size = 32 }) {
 const s = `${size}px`
 return (
  <div
   className="border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"
   style={{ width: s, height: s }}
  />
 )
}

export function LoadingBlock({ label = 'Loading…' }) {
 return (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
   <Spinner size={32} />
   <div className="text-xs">{label}</div>
  </div>
 )
}
