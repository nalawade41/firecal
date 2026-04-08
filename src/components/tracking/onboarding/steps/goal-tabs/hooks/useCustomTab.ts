import { useMemo } from "react"
import type { CustomGoalDetailEntry } from "@/types/onboarding"
import { computeLumpsumNeeded, computeSipNeeded } from "@/engine"
import type { TabProps, UseCustomTabReturn, CustomEntryViewData } from "../types/GoalTabs.types"

export function useCustomTab({ data, updateGoalDetails }: TabProps): UseCustomTabReturn {
  const customDefs = data.customGoalDefinitions

  const merged: CustomGoalDetailEntry[] = useMemo(() => {
    const entries: CustomGoalDetailEntry[] = data.goalDetails.custom ?? []
    return customDefs.map((def) => {
      const existing = entries.find((e) => e.goalId === def.id)
      return existing ?? { goalId: def.id, targetCost: 0, yearsRemaining: 5, inflationExpected: 6, expectedReturns: 12 }
    })
  }, [customDefs, data.goalDetails.custom])

  const entryViews: CustomEntryViewData[] = useMemo(() =>
    customDefs.map((def) => {
      const entry = merged.find((e) => e.goalId === def.id)!
      const inflation = entry.inflationExpected ?? 6
      const expRet = entry.expectedReturns ?? 12
      const inflatedTarget = Math.round(entry.targetCost * Math.pow(1 + inflation / 100, entry.yearsRemaining))
      const lumpsum = entry.yearsRemaining > 0 ? computeLumpsumNeeded(inflatedTarget, expRet / 100, entry.yearsRemaining) : inflatedTarget
      const sip = entry.yearsRemaining > 0 ? computeSipNeeded(inflatedTarget, expRet / 100, entry.yearsRemaining) : 0
      return { defId: def.id, defName: def.name, entry, inflation, expRet, inflatedTarget, lumpsum, sip }
    }), [customDefs, merged])

  function updateEntry(goalId: string, patch: Partial<CustomGoalDetailEntry>) {
    const updated = merged.map((e) => (e.goalId === goalId ? { ...e, ...patch } : e))
    updateGoalDetails({ custom: updated })
  }

  return { entryViews, updateEntry, isEmpty: customDefs.length === 0 }
}
