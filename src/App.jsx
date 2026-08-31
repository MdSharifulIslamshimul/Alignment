import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import OperatingMetricsReview from '@/pages/OperatingMetricsReview'
import WeeklyCadence from '@/pages/WeeklyCadence'
import Signals from '@/pages/Signals'
import SignalDetail from '@/pages/SignalDetail'
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
         <Route path="/cadence" element={<WeeklyCadence />} />
         <Route path="/signals" element={<Signals />} />
         <Route path="/signals/:id" element={<SignalDetail />} />
        </Routes>
       </AppShell>
      </ProtectedRoute>
     }
    />
   </Routes>
  </AuthProvider>
 )
}
