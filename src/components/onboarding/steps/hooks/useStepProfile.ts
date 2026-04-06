import type { StepProps } from "@/types/onboarding"
import type { UseStepProfileReturn } from "../types/Steps.types"

export function useStepProfile({ data, updateData }: StepProps): UseStepProfileReturn {
  function update<K extends keyof typeof data.profile>(key: K, value: typeof data.profile[K]) {
    updateData({ profile: { ...data.profile, [key]: value } })
  }

  return { update }
}
