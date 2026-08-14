import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LineChart, CalendarClock, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'
import { useTheme } from '@/lib/ThemeProvider'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/metrics', label: 'Operating Metrics', icon: LineChart },
  { to: '/cadence', label: 'Weekly Cadence', icon: CalendarClock },
]

function NavItem({ to, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed
            ? 'h-10 w-10 mx-auto justify-center'
            : 'h-9 px-2.5 gap-2.5 text-[13px] font-medium',
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
            size={collapsed ? 18 : 16}
            strokeWidth={isActive ? 2.25 : 1.9}
            className={cn('shrink-0 transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}
          />
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground text-background text-[11px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-40"
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white dark:bg-neutral-900 border-r border-border h-screen sticky top-0 transition-all',
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

      <nav className={cn('flex-1 py-3', collapsed ? 'px-2 space-y-1' : 'px-2 space-y-0.5')}>
        {NAV.map((n) => <NavItem key={n.to} {...n} collapsed={collapsed} />)}
      </nav>

      <div className="mx-3 h-px bg-border/60" />

      <div className={cn('p-2', collapsed ? 'space-y-1.5' : 'space-y-1')}>
        <UserMenu collapsed={collapsed} />
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed ? 'h-8 justify-center' : 'h-8 px-2.5 gap-2.5 text-[12px]'
          )}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed ? 'h-8 justify-center' : 'h-8 px-2.5 gap-2.5 text-[12px]'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : undefined}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
