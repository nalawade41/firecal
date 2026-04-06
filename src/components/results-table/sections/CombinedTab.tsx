import { formatINROrDash as formatINR } from "@/lib/utils"
import type { TabDataProps } from "../types/ResultsTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function CombinedTab({ yearByYear }: TabDataProps) {
  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th className="text-right">Living</Th>
          <Th className="text-right">Education</Th>
          <Th className="text-right">Marriage</Th>
          <Th className="text-right">Whitegoods</Th>
          <Th className="text-right">Travel</Th>
          <Th className="text-right">Healthcare</Th>
          <Th className="text-right">Total</Th>
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
            <Td className="text-right">{formatINR(yr.expense.educationCost)}</Td>
            <Td className="text-right">{formatINR(yr.expense.marriageCost)}</Td>
            <Td className="text-right">{formatINR(yr.expense.whitegoodsCost)}</Td>
            <Td className="text-right">{formatINR(yr.expense.travelCost)}</Td>
            <Td className="text-right">{formatINR(yr.expense.healthcareCost)}</Td>
            <Td className="text-right font-medium">{formatINR(yr.expense.totalExpense)}</Td>
            <Td className="text-right font-medium">{formatINR(yr.expense.withdrawalAmount)}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  )
}
