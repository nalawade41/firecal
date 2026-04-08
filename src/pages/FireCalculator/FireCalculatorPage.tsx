import { useFireCalculator } from "./hooks/useFireCalculator"
import { FIRE_CALCULATOR_DEFAULTS } from "./constants/FireCalculator.constants"
import { FireForm } from "@/components/fire"
import { FireSummary } from "@/components/fire"
import { FireTable } from "@/components/fire"

export function FireCalculatorPage() {
  const { results, handleCalculate } = useFireCalculator()

  return (
    <div className="space-y-8">
      <FireForm initialInputs={FIRE_CALCULATOR_DEFAULTS} onCalculate={handleCalculate} />

      {results && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Results
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <FireSummary summary={results.summary} />
          <FireTable yearByYear={results.yearByYear} goalCategories={results.summary.goalCategories} />
        </div>
      )}
    </div>
  )
}
