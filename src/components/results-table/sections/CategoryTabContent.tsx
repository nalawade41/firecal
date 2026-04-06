import type { CategoryTabContentProps } from "../types/ResultsTable.types"
import { useCategoryTabContent } from "../hooks/useCategoryTabContent"
import { ViewToggle } from "./ViewToggle"
import { MultiBucketPortfolioView } from "./MultiBucketPortfolioView"

export function CategoryTabContent({ yearByYear, bucketLabels, children }: CategoryTabContentProps) {
  const { view, setView } = useCategoryTabContent()

  return (
    <div>
      <ViewToggle view={view} onToggle={setView} />
      {view === "expenses" ? children : (
        <MultiBucketPortfolioView yearByYear={yearByYear} bucketLabels={bucketLabels} />
      )}
    </div>
  )
}
