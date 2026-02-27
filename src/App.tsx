import { useState } from "react"
import type { FireInputs, FireResults } from "@/types"
import { calculateFire } from "@/engine"
import { defaultInputs } from "@/engine/defaults"
import { InputForm } from "@/components/input-form"
import { ResultsSummary } from "@/components/results-summary"
import { ResultsTable } from "@/components/results-table"
import { Flame } from "lucide-react"

function App() {
  const [results, setResults] = useState<FireResults | null>(null)

  function handleCalculate(inputs: FireInputs) {
    const fireResults = calculateFire(inputs)
    setResults(fireResults)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Flame className="h-7 w-7 text-orange-500" />
          <h1 className="text-xl font-bold tracking-tight">FireCal</h1>
          <span className="text-sm text-muted-foreground ml-1">FIRE Planning Calculator</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <InputForm initialInputs={defaultInputs} onCalculate={handleCalculate} />

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
      </main>

      {/* Footer */}
      <footer className="border-t border-white/60 bg-white/40 backdrop-blur-xl mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          FireCal — Phase 1 • All calculations are pre-tax • INR
        </div>
      </footer>
    </div>
  )
}

export default App
