import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function EntryCard({ to, title, description, icon: Icon, meta }) {
  return (
    <Link
      to={to}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="p-6 h-full transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Icon size={20} className="text-foreground" />
          </div>
          <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
        </div>
        <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
        {meta && <div className="mt-4 text-xs text-muted-foreground">{meta}</div>}
      </Card>
    </Link>
  )
}
