import { useState } from "react"
import type { FireInputs, FireResults } from "@/types"
import { calculateFire } from "@/engine"
import type { UseFireCalculatorReturn } from "../types/FireCalculator.types"

export function useFireCalculator(): UseFireCalculatorReturn {
  const [results, setResults] = useState<FireResults | null>(null)

  function handleCalculate(inputs: FireInputs) {
    const fireResults = calculateFire(inputs)
    setResults(fireResults)
  }

  return { results, handleCalculate }
}
