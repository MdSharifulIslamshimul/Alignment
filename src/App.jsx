import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import OperatingMetricsReview from '@/pages/OperatingMetricsReview'
import Discovery from '@/pages/Discovery'
import WeeklyCadence from '@/pages/WeeklyCadence'
import Login from '@/pages/Login'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/metrics" element={<OperatingMetricsReview />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/cadence" element={<WeeklyCadence />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
