import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
 return (
  <select
   ref={ref}
   className={cn(
    'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50',
    className
   )}
   {...props}
  >
   {children}
  </select>
 )
})
