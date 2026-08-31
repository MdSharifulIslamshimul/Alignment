import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
 return (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
   <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
    <AlertTriangle size={20} className="text-red-600" />
   </div>
   <h3 className="text-base font-semibold text-foreground">Couldn't load</h3>
   <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
   {onRetry && (
    <Button size="sm" variant="secondary" className="mt-4" onClick={onRetry}>
     Retry
    </Button>
   )}
  </div>
 )
}
