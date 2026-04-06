import type { StepProps } from "@/types/onboarding"
import { GOAL_NAME_MAP } from "../constants/Steps.constants"
import type { UseStepConfirmationReturn } from "../types/Steps.types"

export function useStepConfirmation({ data }: StepProps): UseStepConfirmationReturn {
  const goalNames = data.selectedGoals
    .filter((g) => g !== "custom")
    .map((g) => GOAL_NAME_MAP[g] ?? g)

  const customNames = data.customGoalDefinitions.map((d) => d.name)
  const allGoalNames = [...goalNames, ...customNames]

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `firecal-plan-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { allGoalNames, downloadJSON }
}
