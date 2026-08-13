import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH } from '@/components/ui/table'
import { FollowUpRow } from './FollowUpRow'

export function WeekSection({ label, items, onCycle, onDelete, onEditNote }) {
  return (
    <Card className="overflow-hidden mb-6">
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-border px-4 md:px-5 py-2.5">
        <div className="text-sm font-semibold tracking-tight text-foreground">{label}</div>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">No priorities logged for this week yet.</div>
      ) : (
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Top Priorities / Follow Up</TH>
              <TH>Owner</TH>
              <TH>Status</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {items.map((f) => (
              <FollowUpRow key={f.id} f={f} onCycle={onCycle} onDelete={onDelete} onEditNote={onEditNote} />
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  )
}
