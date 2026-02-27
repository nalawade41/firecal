import { useState } from "react"
import type { YearResult, GoalCategorySummary } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface ResultsTableProps {
  yearByYear: YearResult[]
  goalCategories?: GoalCategorySummary[]
}

function formatINR(value: number): string {
  if (value === 0) return "—"
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/60">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-left font-medium text-muted-foreground bg-white/50 whitespace-nowrap ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-2 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}

function StatusBadge({ isRetired }: { isRetired: boolean }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${isRetired ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
      {isRetired ? "Retired" : "Working"}
    </span>
  )
}

function rowBg(isRetired: boolean): string {
  return isRetired ? "bg-amber-50/30" : "bg-white/20"
}

// ─── Child Filter ───────────────────────────────────────────
interface ChildFilterProps {
  childCount: number
  selected: number // -1 = all
  onSelect: (idx: number) => void
}

function ChildFilter({ childCount, selected, onSelect }: ChildFilterProps) {
  if (childCount <= 1) return null
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-medium text-muted-foreground">Filter:</span>
      <Button
        size="sm"
        variant={selected === -1 ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onSelect(-1)}
      >
        All Children
      </Button>
      {Array.from({ length: childCount }, (_, i) => (
        <Button
          key={i}
          size="sm"
          variant={selected === i ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => onSelect(i)}
        >
          Child {i + 1}
        </Button>
      ))}
    </div>
  )
}

// ─── Education Tab ──────────────────────────────────────────
function EducationTab({ yearByYear }: ResultsTableProps) {
  const [childFilter, setChildFilter] = useState(-1)
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

// ─── Marriage Tab ───────────────────────────────────────────
function MarriageTab({ yearByYear }: ResultsTableProps) {
  const [childFilter, setChildFilter] = useState(-1)
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

// ─── Healthcare Tab ─────────────────────────────────────────
function HealthcareTab({ yearByYear }: ResultsTableProps) {
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

// ─── Whitegoods Tab ─────────────────────────────────────────
function WhitegoodsTab({ yearByYear }: ResultsTableProps) {
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

// ─── Travel Tab ─────────────────────────────────────────────
function TravelTab({ yearByYear }: ResultsTableProps) {
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

// ─── Living Expense Tab ─────────────────────────────────────
function LivingTab({ yearByYear }: ResultsTableProps) {
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

// ─── Combined Expenses Tab ──────────────────────────────────
function CombinedTab({ yearByYear }: ResultsTableProps) {
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

// ─── Portfolio Tab ──────────────────────────────────────────
function PortfolioTab({ yearByYear }: ResultsTableProps) {
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

// ─── Per-Bucket Portfolio Table ─────────────────────────────
function BucketPortfolioTable({ yearByYear, bucketLabel }: {
  yearByYear: YearResult[]
  bucketLabel: string
}) {
  // Show rows until the portfolio closes to 0, then stop
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

// ─── Multi-Bucket Portfolio View ────────────────────────────
function MultiBucketPortfolioView({ yearByYear, bucketLabels }: {
  yearByYear: YearResult[]
  bucketLabels: string[]
}) {
  const [selected, setSelected] = useState(0)
  if (bucketLabels.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No portfolios for this category.</p>
  }
  return (
    <div>
      {bucketLabels.length > 1 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {bucketLabels.map((label, i) => (
            <Button
              key={label}
              size="sm"
              variant={selected === i ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setSelected(i)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
      <BucketPortfolioTable yearByYear={yearByYear} bucketLabel={bucketLabels[selected]} />
    </div>
  )
}

// ─── View Toggle (Expenses / Portfolio) ─────────────────────
function ViewToggle({ view, onToggle }: { view: "expenses" | "portfolio"; onToggle: (v: "expenses" | "portfolio") => void }) {
  return (
    <div className="flex gap-1 mb-3">
      <Button
        size="sm"
        variant={view === "expenses" ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onToggle("expenses")}
      >
        Expenses
      </Button>
      <Button
        size="sm"
        variant={view === "portfolio" ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onToggle("portfolio")}
      >
        Portfolio
      </Button>
    </div>
  )
}

// ─── Category Tab Wrapper ───────────────────────────────────
function CategoryTabContent({ yearByYear, bucketLabels, children }: {
  yearByYear: YearResult[]
  bucketLabels: string[]
  children: React.ReactNode
}) {
  const [view, setView] = useState<"expenses" | "portfolio">("expenses")
  return (
    <div>
      <ViewToggle view={view} onToggle={setView} />
      {view === "expenses" ? children : (
        <MultiBucketPortfolioView yearByYear={yearByYear} bucketLabels={bucketLabels} />
      )}
    </div>
  )
}

// ─── Helper: extract bucket labels by category ──────────────
function bucketLabelsForCategory(
  goalCategories: GoalCategorySummary[] | undefined,
  category: string
): string[] {
  if (!goalCategories) return []
  const cat = goalCategories.find((c) => c.category === category)
  return cat ? cat.buckets.map((b) => b.label) : []
}

// ─── Main Results Table ─────────────────────────────────────
export function ResultsTable({ yearByYear, goalCategories }: ResultsTableProps) {
  const eduBuckets = bucketLabelsForCategory(goalCategories, "education")
  const marriageBuckets = bucketLabelsForCategory(goalCategories, "marriage")
  const healthcareBuckets = bucketLabelsForCategory(goalCategories, "healthcare")
  const whitegoodsBuckets = bucketLabelsForCategory(goalCategories, "whitegoods")
  const travelBuckets = bucketLabelsForCategory(goalCategories, "travel")

  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold tracking-tight">Year-by-Year Projections</h3>
      <Tabs defaultValue="education">
        <TabsList className="bg-white/60 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="marriage">Marriage</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          <TabsTrigger value="whitegoods">Whitegoods</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="living">Living</TabsTrigger>
          <TabsTrigger value="combined">Combined</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        <TabsContent value="education" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={eduBuckets}>
            <EducationTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="marriage" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={marriageBuckets}>
            <MarriageTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="healthcare" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={healthcareBuckets}>
            <HealthcareTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="whitegoods" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={whitegoodsBuckets}>
            <WhitegoodsTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="travel" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={travelBuckets}>
            <TravelTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="living" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={["Living Expenses"]}>
            <LivingTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="combined" className="mt-4">
          <CombinedTab yearByYear={yearByYear} />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-4">
          <PortfolioTab yearByYear={yearByYear} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
