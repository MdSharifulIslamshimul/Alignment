import { Badge } from '@/components/ui/badge'

const toneFor = (v) => {
  if (v === 'Achieved') return 'positive'
  if (v === 'On track') return 'neutral'
  if (v === 'At risk') return 'medium'
  if (v === 'Missed') return 'negative'
  return 'default'
}

export function AchievedBadge({ value }) {
  return <Badge tone={toneFor(value)}>{value || '—'}</Badge>
}
