import { useTaxHarvest } from "./hooks/useTaxHarvest"
import { TAX_HARVEST_PAGE_TITLE } from "./constants/TaxHarvest.constants"
import { TaxHarvestInputForm } from "@/components/tax-harvest-input-form"
import { TaxHarvestResultsView } from "@/components/tax-harvest-results"

export function TaxHarvestPage() {
  const { results, handleCalculate } = useTaxHarvest()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-base font-bold text-rose-900 uppercase tracking-wider">
          {TAX_HARVEST_PAGE_TITLE}
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <TaxHarvestInputForm onCalculate={handleCalculate} />

      {results && <TaxHarvestResultsView results={results} />}
    </div>
  )
}
