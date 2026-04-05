import { useState } from "react"
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router"
import type { FireInputs, FireResults } from "@/types"
import type { TaxHarvestInputs, TaxHarvestResults } from "@/types/tax-harvest"
import { calculateFire } from "@/engine"
import { defaultInputs } from "@/engine/defaults"
import { InputForm } from "@/components/input-form"
import { ResultsSummary } from "@/components/results-summary"
import { ResultsTable } from "@/components/results-table"
import { TaxHarvestInputForm } from "@/components/tax-harvest-input-form"
import { TaxHarvestResultsView } from "@/components/tax-harvest-results"
import { calculateTaxHarvest } from "@/engine/tax-harvest/calculator"
import { Flame, Leaf, BarChart3 } from "lucide-react"
import { TrackingPage } from "@/pages/Tracking"

function FireCalculator() {
  const [results, setResults] = useState<FireResults | null>(null)

  function handleCalculate(inputs: FireInputs) {
    const fireResults = calculateFire(inputs)
    setResults(fireResults)
  }

  return (
    <div className="space-y-8">
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
    </div>
  )
}

function TaxHarvestTool() {
  const [results, setResults] = useState<TaxHarvestResults | null>(null)

  function handleCalculate(inputs: TaxHarvestInputs) {
    const harvestResults = calculateTaxHarvest(inputs)
    setResults(harvestResults)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-base font-bold text-rose-900 uppercase tracking-wider">
          LTCG Tax Harvesting Tool
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <TaxHarvestInputForm onCalculate={handleCalculate} />

      {results && <TaxHarvestResultsView results={results} />}
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const activePath = location.pathname

  function navClass(path: string, activeColor: string) {
    return `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activePath === path ? activeColor : "text-muted-foreground hover:bg-slate-100"
    }`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-7 w-7 text-orange-500" />
            <h1 className="text-xl font-bold tracking-tight">FireCal</h1>
            <span className="text-sm text-muted-foreground ml-1">FIRE Planning & Tax Tools</span>
          </div>
          <nav className="flex gap-2 items-center">
            <Link to="/" className={navClass("/", "bg-orange-100 text-orange-700")}>
              FIRE Calculator
            </Link>
            <Link to="/tax-harvest" className={navClass("/tax-harvest", "bg-emerald-100 text-emerald-700")}>
              <Leaf className="h-4 w-4 inline mr-1" />
              Tax Harvest
            </Link>
            <Link to="/tracking" className={navClass("/tracking", "bg-blue-100 text-blue-700")}>
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Tracking
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 space-y-8 w-full">
        <Routes>
          <Route path="/" element={<FireCalculator />} />
          <Route path="/tax-harvest" element={<TaxHarvestTool />} />
          <Route path="/tracking" element={<TrackingPage />} />
        </Routes>
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

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
