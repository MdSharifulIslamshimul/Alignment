import { cn } from '@/lib/utils'

export function Table({ className, ...props }) {
 return (
  <div className="w-full overflow-x-auto">
   <table className={cn('w-full text-sm', className)} {...props} />
  </div>
 )
}

export function THead({ className, ...props }) {
 return <thead className={cn('bg-muted/40', className)} {...props} />
}

export function TBody({ className, ...props }) {
 return <tbody className={className} {...props} />
}

export function TR({ className, ...props }) {
 return <tr className={cn('border-b border-border hover:bg-muted/50 transition-colors duration-200', className)} {...props} />
}

export function TH({ className, ...props }) {
 return <th className={cn('px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider', className)} {...props} />
}

export function TD({ className, ...props }) {
 return <td className={cn('px-4 py-3 align-middle', className)} {...props} />
}
