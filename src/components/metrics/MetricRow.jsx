import { Trash2 } from 'lucide-react'
import { InlineText } from '@/components/ui/inline-text'
import { AchievedDropdown } from './AchievedDropdown'
import { FollowUpDate } from './FollowUpDate'

export function MetricRow({ index, row, onChange, onDelete }) {
 const edit = (key, value) => onChange(row.id, key, value)

 return (
  <tr className="border-t border-border hover:bg-muted/30 transition-colors duration-200">
   <td className="align-top py-3 pl-4 pr-2 text-xs text-muted-foreground tabular-nums">{index}</td>
   <td className="align-top py-2 pr-2">
    <InlineText
     value={row.objective}
     onCommit={(v) => edit('objective', v)}
     placeholder="Objective"
     textClassName="text-[13px] font-semibold text-foreground leading-snug"
     multiline
    />
   </td>
   <td className="align-top py-2 pr-2">
    <InlineText
     value={row.initiative}
     onCommit={(v) => edit('initiative', v)}
     placeholder="Initiative"
     textClassName="text-[13px] text-foreground/90 leading-snug"
     multiline
    />
   </td>
   <td className="align-top py-2 pr-2">
    <InlineText
     value={row.squad}
     onCommit={(v) => edit('squad', v)}
     placeholder="Squad"
     textClassName="text-[13px] text-muted-foreground leading-snug"
     multiline
    />
   </td>
   <td className="align-top py-2 pr-2">
    <InlineText
     value={row.metric}
     onCommit={(v) => edit('metric', v)}
     placeholder="Success metric"
     textClassName="text-[13px] text-foreground/90 leading-snug"
     multiline
    />
   </td>
   <td className="align-top py-2 pr-2">
    <InlineText
     value={row.baseline}
     onCommit={(v) => edit('baseline', v)}
     placeholder="—"
     textClassName="text-[13px] text-foreground/80"
     multiline={false}
     align="right"
    />
   </td>
   <td className="align-top py-2 pr-2">
    <InlineText
     value={row.target}
     onCommit={(v) => edit('target', v)}
     placeholder="—"
     textClassName="text-[13px] text-foreground/80"
     multiline={false}
     align="right"
    />
   </td>
   <td className="align-top py-3 pr-2">
    <AchievedDropdown value={row.achieved} onChange={(v) => edit('achieved', v)} />
   </td>
   <td className="align-top py-3 pr-2">
    <FollowUpDate value={row.followUp} onChange={(v) => edit('followUp', v)} />
   </td>
   <td className="align-top py-3 pr-3 text-right">
    <button
     onClick={() => onDelete(row.id)}
     className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-200"
     aria-label="Delete row"
    >
     <Trash2 size={13} />
    </button>
   </td>
  </tr>
 )
}
