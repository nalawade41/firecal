import { useState } from "react"
import type { TaxHarvestInputs, TaxHarvestResults } from "@/types/tax-harvest"
import { calculateTaxHarvest } from "@/engine/tax-harvest/calculator"
import type { UseTaxHarvestReturn } from "../types/TaxHarvest.types"

export function useTaxHarvest(): UseTaxHarvestReturn {
  const [results, setResults] = useState<TaxHarvestResults | null>(null)

  function handleCalculate(inputs: TaxHarvestInputs) {
    const harvestResults = calculateTaxHarvest(inputs)
    setResults(harvestResults)
  }

  return { results, handleCalculate }
}
