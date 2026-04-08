import { formatINROrDash as formatINR } from "@/utils"
import type { TabDataProps } from "../types/FireTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function HealthcareTab({ yearByYear }: TabDataProps) {
  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          <Th className="text-right">Medical</Th>
          <Th className="text-right">Insurance</Th>
          <Th className="text-right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {yearByYear.map((yr) => (
          <tr key={yr.timeline.yearIndex} className={rowBg(yr.timeline.isRetired)}>
            <Td>{yr.timeline.calendarYear}</Td>
            <Td>{yr.timeline.userAge}</Td>
            <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
            <Td className="text-right">{formatINR(yr.healthcare.medicalCost)}</Td>
            <Td className="text-right">{formatINR(yr.healthcare.insuranceCost)}</Td>
            <Td className="text-right font-medium">{formatINR(yr.healthcare.totalHealthcareCost)}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  )
}
