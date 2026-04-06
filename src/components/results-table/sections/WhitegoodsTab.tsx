import { formatINROrDash as formatINR } from "@/lib/utils"
import type { TabDataProps } from "../types/ResultsTable.types"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"

export function WhitegoodsTab({ yearByYear }: TabDataProps) {
  const itemNames = yearByYear.length > 0 ? yearByYear[0].whitegoods.perItem.map((i) => i.itemName) : []
  const relevantYears = yearByYear.filter((yr) => yr.whitegoods.totalWhitegoodsCost > 0)

  if (relevantYears.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No whitegoods replacements in the projection period.</p>
  }

  return (
    <TableWrapper>
      <thead>
        <tr>
          <Th>Year</Th>
          <Th>Age</Th>
          <Th>Status</Th>
          {itemNames.map((name) => (
            <Th key={name} className="text-right">{name}</Th>
          ))}
          <Th className="text-right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {relevantYears.map((yr) => (
          <tr key={yr.timeline.yearIndex} className={rowBg(yr.timeline.isRetired)}>
            <Td>{yr.timeline.calendarYear}</Td>
            <Td>{yr.timeline.userAge}</Td>
            <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
            {yr.whitegoods.perItem.map((item) => (
              <Td key={item.itemName} className="text-right">{formatINR(item.cost)}</Td>
            ))}
            <Td className="text-right font-medium">{formatINR(yr.whitegoods.totalWhitegoodsCost)}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  )
}
