import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LineChart, Compass, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, shortcut: '1' },
  { to: '/metrics', label: 'Operating Metrics', icon: LineChart, shortcut: '2' },
  { to: '/discovery', label: 'Discovery', icon: Compass, shortcut: '3' },
  { to: '/cadence', label: 'Weekly Cadence', icon: CalendarClock, shortcut: '4' },
]

function NavItem({ to, label, icon: Icon, end, shortcut, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2.5 rounded-lg h-9 px-2.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
            : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-foreground" />
          )}
          <Icon
            size={16}
            strokeWidth={isActive ? 2.25 : 1.9}
            className={cn('shrink-0 transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}
          />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{label}</span>
              {shortcut && (
                <kbd
                  aria-hidden="true"
                  className={cn(
                    'hidden lg:inline-flex items-center justify-center h-4 min-w-4 px-1 rounded text-[10px] font-medium tabular-nums border transition-colors duration-200',
                    isActive
                      ? 'text-muted-foreground border-border/70 bg-muted/40'
                      : 'text-muted-foreground/60 border-transparent group-hover:border-border/60 group-hover:bg-muted/40'
                  )}
                >
                  {shortcut}
                </kbd>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-[#fbfbfd] border-r border-border h-screen sticky top-0 transition-all',
        collapsed ? 'w-[64px]' : 'w-[240px]'
      )}
      style={{ transitionDuration: '300ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
    >
      <div className={cn('flex items-center h-14 px-3', collapsed && 'justify-center px-0')}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'gap-0')}>
          <div className="h-8 w-8 rounded-[10px] bg-primary text-primary-foreground grid place-items-center text-[14px] font-bold tracking-tight shadow-[0_1px_2px_rgba(0,0,0,0.06)]">N</div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-[14px] font-semibold tracking-tight">Neeva</span>
              <span className="text-[10.5px] text-muted-foreground mt-0.5">Project Alignment</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-3 h-px bg-border/60" />

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((n) => <NavItem key={n.to} {...n} collapsed={collapsed} />)}
      </nav>

      <div className="mx-3 h-px bg-border/60" />

      <div className="p-2 space-y-1">
        <UserMenu collapsed={collapsed} />
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg h-8 px-2.5 text-[12px] text-muted-foreground hover:text-foreground hover:bg-card/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'justify-center px-0'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span className="text-[12px]">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
