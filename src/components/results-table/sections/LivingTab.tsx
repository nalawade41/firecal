import { formatINROrDash as formatINR } from "@/lib/utils"
import type { TabDataProps } from "../types/ResultsTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function LivingTab({ yearByYear }: TabDataProps) {
  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th className="text-right">Living Expense</Th>
          <Th className="text-right">Withdrawal</Th>
        </tr>
      </thead>
      <tbody>
        {yearByYear.map((yr) => (
          <tr key={yr.timeline.yearIndex} className={rowBg(yr.timeline.isRetired)}>
            <Td>{yr.timeline.calendarYear}</Td>
            <Td>{yr.timeline.userAge}</Td>
            <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
            <Td className="text-right">{formatINR(yr.expense.livingExpense)}</Td>
            <Td className="text-right font-medium">
              {yr.timeline.isRetired ? formatINR(yr.expense.livingExpense) : "—"}
            </Td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  )
}
