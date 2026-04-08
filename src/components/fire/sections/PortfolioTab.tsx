import { formatINROrDash as formatINR } from "@/utils"
import type { TabDataProps } from "../types/FireTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function PortfolioTab({ yearByYear }: TabDataProps) {
  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th className="text-right">Opening</Th>
          <Th className="text-right">Contribution</Th>
          <Th className="text-right">Withdrawal</Th>
          <Th className="text-right">Equity %</Th>
          <Th className="text-right">Return</Th>
          <Th className="text-right">Closing</Th>
        </tr>
      </thead>
      <tbody>
        {yearByYear.map((yr) => (
          <tr
            key={yr.timeline.yearIndex}
            className={yr.portfolio.isDepleted ? "bg-red-50/40" : rowBg(yr.timeline.isRetired)}
          >
            <Td>{yr.timeline.calendarYear}</Td>
            <Td>{yr.timeline.userAge}</Td>
            <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
            <Td className="text-right">{formatINR(yr.portfolio.openingBalance)}</Td>
            <Td className="text-right">{formatINR(yr.portfolio.contribution)}</Td>
            <Td className="text-right">{formatINR(yr.portfolio.withdrawal)}</Td>
            <Td className="text-right">{yr.portfolio.equityPercent.toFixed(1)}%</Td>
            <Td className="text-right">{formatINR(yr.portfolio.returnAmount)}</Td>
            <Td className={`text-right font-medium ${yr.portfolio.isDepleted ? "text-red-600" : ""}`}>
              {yr.portfolio.isDepleted ? "DEPLETED" : formatINR(yr.portfolio.closingBalance)}
            </Td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  )
}
