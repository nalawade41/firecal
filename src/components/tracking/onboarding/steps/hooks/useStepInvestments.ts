import type { StepProps } from "@/types/onboarding"
import type { UseStepInvestmentsReturn } from "../types/Steps.types"

export function useStepInvestments({ data, updateData }: StepProps): UseStepInvestmentsReturn {
  function update<K extends keyof typeof data.investments>(key: K, value: typeof data.investments[K]) {
    updateData({ investments: { ...data.investments, [key]: value } })
  }

  return { update }
}
