import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
 return (
  <input
   ref={ref}
   type={type}
   className={cn(
    'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50',
    className
   )}
   {...props}
  />
 )
})
