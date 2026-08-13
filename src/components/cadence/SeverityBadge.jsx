import { Badge } from '@/components/ui/badge'

export function SeverityBadge({ value }) {
  return <Badge tone={value}>{value}</Badge>
}
