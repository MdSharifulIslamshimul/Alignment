export const initialMetrics = [
  {
    id: 'm1',
    objective: 'North Star Growth',
    initiative: 'Activation redesign',
    squad: 'Growth · Wing A',
    metric: 'Week-1 activation rate',
    baseline: '38%',
    target: '52%',
    delivery: '2026-09-15',
    followUp: '2026-08-25',
    achieved: 'On track',
    owner: 'Priya S.',
  },
  {
    id: 'm2',
    objective: 'Retention',
    initiative: 'Habit loop nudges',
    squad: 'Retention · Wing B',
    metric: 'D30 retention',
    baseline: '21%',
    target: '28%',
    delivery: '2026-10-01',
    followUp: '2026-09-05',
    achieved: 'At risk',
    owner: 'Diego M.',
  },
  {
    id: 'm3',
    objective: 'Monetization',
    initiative: 'Pricing v3 rollout',
    squad: 'Monetization · Wing C',
    metric: 'ARPU',
    baseline: '$14.20',
    target: '$18.50',
    delivery: '2026-11-30',
    followUp: '2026-10-20',
    achieved: 'On track',
    owner: 'Aiko T.',
  },
  {
    id: 'm4',
    objective: 'Enterprise Trust',
    initiative: 'SOC 2 Type II',
    squad: 'Platform · Wing D',
    metric: 'Audit completion',
    baseline: '0%',
    target: '100%',
    delivery: '2026-12-31',
    followUp: '2026-11-01',
    achieved: 'On track',
    owner: 'Marcus K.',
  },
]

export const trend = [
  { month: 'Feb', activation: 34, retention: 19, arpu: 13.2 },
  { month: 'Mar', activation: 36, retention: 20, arpu: 13.6 },
  { month: 'Apr', activation: 37, retention: 20, arpu: 13.9 },
  { month: 'May', activation: 38, retention: 21, arpu: 14.2 },
  { month: 'Jun', activation: 40, retention: 22, arpu: 14.7 },
  { month: 'Jul', activation: 43, retention: 23, arpu: 15.4 },
  { month: 'Aug', activation: 45, retention: 23, arpu: 15.9 },
]

export const whitespace = [
  { segment: 'SMB · US', ourStrength: 82, marketCoverage: 46, note: 'Underserved by legacy incumbents' },
  { segment: 'Mid-market · EU', ourStrength: 61, marketCoverage: 71, note: 'Strong local competition' },
  { segment: 'Enterprise · APAC', ourStrength: 38, marketCoverage: 58, note: 'Localization gap' },
  { segment: 'Prosumer · Global', ourStrength: 74, marketCoverage: 33, note: 'Emerging pull from creators' },
  { segment: 'Regulated · Health', ourStrength: 25, marketCoverage: 22, note: 'Whitespace, needs compliance' },
]

export const competitors = [
  { name: 'Northwind', positioning: 'Enterprise legacy', delta: 'Slower ship velocity', sentiment: 'neutral' },
  { name: 'Vela', positioning: 'AI-native newcomer', delta: 'Aggressive pricing', sentiment: 'negative' },
  { name: 'Mercer', positioning: 'Design-led mid-market', delta: 'Best-in-class UX', sentiment: 'mixed' },
  { name: 'Ortus', positioning: 'Vertical (Health)', delta: 'Compliance moat', sentiment: 'neutral' },
]

export const productInsights = [
  { title: 'Onboarding drop-off at Step 3', evidence: 'Session recordings + 41% funnel loss', sentiment: 'negative' },
  { title: 'Power users love keyboard nav', evidence: '92 pos. mentions past 30d', sentiment: 'positive' },
  { title: 'Mobile export is confusing', evidence: 'Top support ticket cluster', sentiment: 'negative' },
  { title: 'Team spaces show viral pull', evidence: '2.1x invites/user MoM', sentiment: 'positive' },
]

export const initialFollowUps = [
  {
    id: 'f1',
    item: 'Confirm activation A/B ship date',
    owner: 'Priya S.',
    due: '2026-08-16',
    severity: 'high',
    status: 'open',
    context: 'Blocked on analytics review',
  },
  {
    id: 'f2',
    item: 'Draft pricing v3 rollout comms',
    owner: 'Aiko T.',
    due: '2026-08-18',
    severity: 'medium',
    status: 'in_progress',
    context: 'Waiting on legal sign-off',
  },
  {
    id: 'f3',
    item: 'Retention nudges — narrow scope',
    owner: 'Diego M.',
    due: '2026-08-14',
    severity: 'critical',
    status: 'open',
    context: 'Scope too broad for cycle',
  },
  {
    id: 'f4',
    item: 'SOC 2 evidence request pack',
    owner: 'Marcus K.',
    due: '2026-08-22',
    severity: 'low',
    status: 'in_progress',
    context: 'Auditor confirmed list',
  },
]

export const initialBlockers = [
  {
    id: 'b1',
    title: 'Analytics warehouse latency',
    impact: 'Delays activation experiment reads by 24h',
    owner: 'Data Platform',
    severity: 'high',
    since: '2026-08-08',
  },
  {
    id: 'b2',
    title: 'Design review capacity',
    impact: 'Two initiatives waiting on review slots',
    owner: 'Design Ops',
    severity: 'medium',
    since: '2026-08-11',
  },
]
