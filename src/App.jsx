import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import OperatingMetricsReview from '@/pages/OperatingMetricsReview'
import Discovery from '@/pages/Discovery'
import WeeklyCadence from '@/pages/WeeklyCadence'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/metrics" element={<OperatingMetricsReview />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/cadence" element={<WeeklyCadence />} />
      </Routes>
    </AppShell>
  )
}
