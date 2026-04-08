import type { YearResult } from "@/types"
import { formatINROrDash as formatINR } from "@/utils"
import type { BucketPortfolioTableProps } from "../types/FireTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function BucketPortfolioTable({ yearByYear, bucketLabel }: BucketPortfolioTableProps) {
  const rows: YearResult[] = []
  let closed = false
  for (const yr of yearByYear) {
    if (closed) break
    const p = yr.bucketPortfolios[bucketLabel]
    if (!p || (p.openingBalance === 0 && p.withdrawal === 0 && p.contribution === 0)) continue
    rows.push(yr)
    if (p.closingBalance === 0 && p.openingBalance > 0) closed = true
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No portfolio activity.</p>
  }

  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th className="text-right">Opening</Th>
          <Th className="text-right">SIP (Annual)</Th>
          <Th className="text-right">Withdrawal</Th>
          <Th className="text-right">Return %</Th>
          <Th className="text-right">Return</Th>
          <Th className="text-right">Closing</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((yr) => {
          const p = yr.bucketPortfolios[bucketLabel]
          return (
            <tr
              key={yr.timeline.yearIndex}
              className={p.isDepleted ? "bg-red-50/40" : rowBg(yr.timeline.isRetired)}
            >
              <Td>{yr.timeline.calendarYear}</Td>
              <Td>{yr.timeline.userAge}</Td>
              <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
              <Td className="text-right">{formatINR(p.openingBalance)}</Td>
              <Td className="text-right">{formatINR(p.contribution)}</Td>
              <Td className="text-right">{formatINR(p.withdrawal)}</Td>
              <Td className="text-right">{p.returnPercent.toFixed(1)}%</Td>
              <Td className="text-right">{formatINR(p.returnAmount)}</Td>
              <Td className={`text-right font-medium ${p.isDepleted ? "text-red-600" : ""}`}>
                {p.isDepleted ? "DEPLETED" : formatINR(p.closingBalance)}
              </Td>
            </tr>
          )
        })}
      </tbody>
    </TableWrapper>
  )
}
