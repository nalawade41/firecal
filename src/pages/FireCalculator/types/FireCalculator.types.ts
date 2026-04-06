import type { FireInputs, FireResults } from "@/types"

export interface UseFireCalculatorReturn {
  results: FireResults | null
  handleCalculate: (inputs: FireInputs) => void
}
