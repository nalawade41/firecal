import { formatINROrDash as formatINR } from "@/utils"
import type { TabDataProps } from "../types/FireTable.types"
import { useChildFilter } from "../hooks/useChildFilter"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"
import { ChildFilter } from "./ChildFilter"

export function MarriageTab({ yearByYear }: TabDataProps) {
  const { childFilter, setChildFilter } = useChildFilter()
  const childCount = yearByYear.length > 0 ? yearByYear[0].marriage.perChild.length : 0

  if (childCount === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No children configured.</p>
  }

  const relevantYears = yearByYear.filter((yr) => {
    if (childFilter === -1) return yr.marriage.totalMarriageCost > 0
    return yr.marriage.perChild[childFilter]?.cost > 0
  })

  if (relevantYears.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No marriage costs in the projection period.</p>
  }

  return (
    <div>
      <ChildFilter childCount={childCount} selected={childFilter} onSelect={setChildFilter} />
      <TableWrapper>
        <thead>
          <tr>
            <Th>Year</Th>
            <Th>Age</Th>
            <Th>Status</Th>
            <Th>Child Age</Th>
            {childFilter === -1 && childCount > 1 && Array.from({ length: childCount }, (_, i) => (
              <Th key={i} className="text-right">Child {i + 1}</Th>
            ))}
            <Th className="text-right">Cost</Th>
          </tr>
        </thead>
        <tbody>
          {relevantYears.map((yr) => {
            const total = childFilter === -1
              ? yr.marriage.totalMarriageCost
              : yr.marriage.perChild[childFilter].cost

            return (
              <tr key={yr.timeline.yearIndex} className={rowBg(yr.timeline.isRetired)}>
                <Td>{yr.timeline.calendarYear}</Td>
                <Td>{yr.timeline.userAge}</Td>
                <Td><StatusBadge isRetired={yr.timeline.isRetired} /></Td>
                <Td>
                  {childFilter === -1
                    ? yr.timeline.childAges.join(", ")
                    : yr.timeline.childAges[childFilter]}
                </Td>
                {childFilter === -1 && childCount > 1 && yr.marriage.perChild.map((child, i) => (
                  <Td key={i} className="text-right">{formatINR(child.cost)}</Td>
                ))}
                <Td className="text-right font-medium">{formatINR(total)}</Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrapper>
    </div>
  )
}
