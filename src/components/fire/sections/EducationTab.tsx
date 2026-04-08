import { formatINROrDash as formatINR } from "@/utils"
import type { TabDataProps } from "../types/FireTable.types"
import { useChildFilter } from "../hooks/useChildFilter"
import { rowBg } from "../utils/tableHelpers"
import { TableWrapper, Th, Td, StatusBadge } from "./TablePrimitives"
import { ChildFilter } from "./ChildFilter"

export function EducationTab({ yearByYear }: TabDataProps) {
  const { childFilter, setChildFilter } = useChildFilter()
  const childCount = yearByYear.length > 0 ? yearByYear[0].education.perChild.length : 0

  if (childCount === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No children configured.</p>
  }

  const relevantYears = yearByYear.filter((yr) => {
    if (childFilter === -1) return yr.education.totalEducationCost > 0
    return yr.education.perChild[childFilter]?.totalCost > 0
  })

  if (relevantYears.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No education costs in the projection period.</p>
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
            <Th className="text-right">School</Th>
            <Th className="text-right">Graduation</Th>
            <Th className="text-right">Post Grad</Th>
            {childFilter === -1 && childCount > 1 && Array.from({ length: childCount }, (_, i) => (
              <Th key={i} className="text-right">Child {i + 1}</Th>
            ))}
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {relevantYears.map((yr) => {
            const children = childFilter === -1 ? yr.education.perChild : [yr.education.perChild[childFilter]]
            const school = children.reduce((s, c) => s + c.schoolCost, 0)
            const grad = children.reduce((s, c) => s + c.graduationCost, 0)
            const pg = children.reduce((s, c) => s + c.postGraduationCost, 0)
            const total = childFilter === -1
              ? yr.education.totalEducationCost
              : yr.education.perChild[childFilter].totalCost

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
                <Td className="text-right">{formatINR(school)}</Td>
                <Td className="text-right">{formatINR(grad)}</Td>
                <Td className="text-right">{formatINR(pg)}</Td>
                {childFilter === -1 && childCount > 1 && yr.education.perChild.map((child, i) => (
                  <Td key={i} className="text-right">{formatINR(child.totalCost)}</Td>
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
