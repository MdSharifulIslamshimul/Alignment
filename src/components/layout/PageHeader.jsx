import { cn } from '@/lib/utils'

export function PageHeader({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        'sticky top-0 z-30 -mx-5 md:-mx-8 px-5 md:px-8 py-4 md:py-5 mb-6 md:mb-8 bg-[#fbfbfd]/85 backdrop-blur-xl border-b border-border',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-[-0.02em] leading-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
