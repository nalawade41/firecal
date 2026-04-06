import type { TaxHarvestInputs, TaxHarvestResults } from "@/types/tax-harvest"

export interface UseTaxHarvestReturn {
  results: TaxHarvestResults | null
  handleCalculate: (inputs: TaxHarvestInputs) => void
}
