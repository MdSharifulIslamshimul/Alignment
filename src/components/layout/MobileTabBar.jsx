import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LineChart, CalendarClock, Radar } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/metrics', label: 'Metrics', icon: LineChart },
  { to: '/cadence', label: 'Cadence', icon: CalendarClock },
  { to: '/signals', label: 'Signals', icon: Radar },
]

export function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-border">
      <div className="grid grid-cols-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 min-h-[44px] py-2 text-[11px] font-medium transition-colors duration-200',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
