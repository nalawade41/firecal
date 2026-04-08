import { useMemo } from "react"
import type { GraduationGoalEntry } from "@/types/onboarding"
import { computeGraduationCorpus } from "@/engine"
import type { TabProps, UseGraduationTabReturn, GraduationEntryViewData } from "../types/GoalTabs.types"

export function useGraduationTab({ data, updateGoalDetails }: TabProps): UseGraduationTabReturn {
  const childCount = Math.max(data.profile.numberOfChildren, 1)
  const existing = data.goalDetails.graduation

  const entries: GraduationGoalEntry[] = useMemo(() => {
    const ex = existing ?? []
    return Array.from({ length: childCount }, (_, i) =>
      ex[i] ?? { label: `Child ${i + 1}`, graduationCostCurrent: 0, expectedInflationYearly: 5, horizonYears: 12, expectedReturns: 12 }
    )
  }, [childCount, existing])

  const entryViews: GraduationEntryViewData[] = useMemo(() =>
    entries.map((entry, idx) => {
      const horizon = entry.horizonYears ?? 12
      const expRet = entry.expectedReturns ?? 12
      const result = computeGraduationCorpus(
        entry.graduationCostCurrent,
        entry.expectedInflationYearly / 100,
        horizon,
        expRet / 100,
      )
      return {
        entry, index: idx, horizon, expRet,
        targetCorpus: result.targetCorpus,
        lumpsumNeeded: result.lumpsumNeeded,
        sipNeeded: result.sipNeeded,
      }
    }), [entries])

  function updateEntry(index: number, patch: Partial<GraduationGoalEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ graduation: updated })
  }

  return { entryViews, updateEntry }
}
