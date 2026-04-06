import { useFireCalculator } from "./hooks/useFireCalculator"
import { FIRE_CALCULATOR_DEFAULTS } from "./constants/FireCalculator.constants"
import { InputForm } from "@/components/input-form"
import { ResultsSummary } from "@/components/results-summary"
import { ResultsTable } from "@/components/results-table"

export function FireCalculatorPage() {
  const { results, handleCalculate } = useFireCalculator()

  return (
    <div className="space-y-8">
      <InputForm initialInputs={FIRE_CALCULATOR_DEFAULTS} onCalculate={handleCalculate} />

      {results && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Results
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <ResultsSummary summary={results.summary} />
          <ResultsTable yearByYear={results.yearByYear} goalCategories={results.summary.goalCategories} />
        </div>
      )}
    </div>
  )
}
