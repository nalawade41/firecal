import { formatINROrDash as formatINR } from "@/utils"
import type { TabDataProps } from "../types/FireTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function TravelTab({ yearByYear }: TabDataProps) {
  const relevantYears = yearByYear.filter((yr) => yr.travel > 0)

  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th className="text-right">Travel Cost</Th>
        </tr>
      </thead>
      <tbody>
        {relevantYears.map((yr) => (
          <tr key={yr.timeline.yearIndex} className={rowBg(yr.timeline.isRetired)}>
            <Td>{yr.timeline.calendarYear}</Td>
            <Td>{yr.timeline.userAge}</Td>
            <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
            <Td className="text-right font-medium">{formatINR(yr.travel)}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  )
}
