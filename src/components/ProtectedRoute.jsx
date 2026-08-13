import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'
import { LoadingBlock } from '@/components/ui/loading'

export function ProtectedRoute({ children }) {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-[#fbfbfd]">
        <LoadingBlock label="Signing you in…" />
      </div>
    )
  }
  if (status !== 'ready') return <Navigate to="/login" replace />
  return children
}
