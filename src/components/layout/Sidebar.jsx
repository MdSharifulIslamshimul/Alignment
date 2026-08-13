import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LineChart, Compass, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/metrics', label: 'Operating Metrics', icon: LineChart },
  { to: '/discovery', label: 'Discovery', icon: Compass },
  { to: '/cadence', label: 'Weekly Cadence', icon: CalendarClock },
]

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white border-r border-border h-screen sticky top-0 transition-all',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
      style={{ transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
    >
      <div className={cn('flex items-center h-14 px-4 border-b border-border', collapsed && 'justify-center px-0')}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground grid place-items-center text-[13px] font-bold">A</div>
            <span className="text-[15px] font-semibold tracking-tight">Alignment</span>
          </div>
        )}
        {collapsed && (
          <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground grid place-items-center text-[13px] font-bold">A</div>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                collapsed && 'justify-center px-0'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="mx-2 mb-3 flex items-center justify-center h-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-200"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
