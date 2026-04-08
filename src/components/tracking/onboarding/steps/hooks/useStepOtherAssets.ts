import type { StepProps, OtherAssets } from "@/types/onboarding"
import type { UseStepOtherAssetsReturn } from "../types/Steps.types"

export function useStepOtherAssets({ data, updateData }: StepProps): UseStepOtherAssetsReturn {
  const assets = data.otherAssets

  function update(patch: Partial<OtherAssets>) {
    updateData({ otherAssets: { ...assets, ...patch } })
  }

  return { assets, update }
}
