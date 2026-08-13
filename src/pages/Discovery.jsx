import { Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { WhitespaceRow } from '@/components/discovery/WhitespaceRow'
import { CompetitorCard } from '@/components/discovery/CompetitorCard'
import { InsightItem } from '@/components/discovery/InsightItem'
import { whitespace, competitors, productInsights } from '@/lib/mockData'

export default function Discovery() {
  return (
    <>
      <PageHeader
        title="Discovery"
        description="Whitespace, positioning, and product & competitive signals."
        actions={<Button variant="secondary" size="sm"><Sparkles size={14} /> Summarize week</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Whitespace segments</div>
          <div className="mt-3 text-[28px] font-bold tracking-[-0.02em] leading-none">5</div>
          <div className="mt-2 text-xs text-muted-foreground">2 underserved by incumbents</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Competitors tracked</div>
          <div className="mt-3 text-[28px] font-bold tracking-[-0.02em] leading-none">4</div>
          <div className="mt-2 text-xs text-muted-foreground">1 new positioning shift</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product signals</div>
          <div className="mt-3 text-[28px] font-bold tracking-[-0.02em] leading-none">{productInsights.length}</div>
          <div className="mt-2 text-xs text-muted-foreground">2 positive · 2 negative</div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Whitespace analysis</CardTitle>
          <CardDescription>Our strength vs market coverage across target segments.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Segment</TH>
                <TH>Our strength</TH>
                <TH>Market coverage</TH>
                <TH>Note</TH>
              </TR>
            </THead>
            <TBody>{whitespace.map((w) => <WhitespaceRow key={w.segment} row={w} />)}</TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight mb-4">Positioning · Competitors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {competitors.map((c) => <CompetitorCard key={c.name} c={c} />)}
          </div>
        </div>
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight mb-4">Product & customer signals</h2>
          <Card className="p-5">
            {productInsights.map((i) => <InsightItem key={i.title} i={i} />)}
          </Card>
        </div>
      </div>
    </>
  )
}
