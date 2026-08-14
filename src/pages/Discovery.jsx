import { Compass } from 'lucide-react'

export default function Discovery() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-[360px]">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/60 grid place-items-center">
          <Compass size={20} className="text-muted-foreground" strokeWidth={1.8} />
        </div>
        <div className="mt-4 text-[15px] font-semibold tracking-tight">Discovery</div>
        <div className="mt-1 text-[13px] text-muted-foreground">Coming next — whitespace, positioning, and product / competitive signals.</div>
      </div>
    </div>
  )
}
