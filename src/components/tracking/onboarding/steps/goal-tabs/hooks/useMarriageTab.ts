import { useMemo } from "react"
import type { MarriageGoalEntry } from "@/types/onboarding"
import { computeMarriageCorpus } from "@/engine"
import type { TabProps, UseMarriageTabReturn, MarriageEntryViewData } from "../types/GoalTabs.types"

export function useMarriageTab({ data, updateGoalDetails }: TabProps): UseMarriageTabReturn {
  const childCount = Math.max(data.profile.numberOfChildren, 1)
  const existing = data.goalDetails.marriage

  const entries: MarriageGoalEntry[] = useMemo(() => {
    const ex = existing ?? []
    return ex.length > 0
      ? ex.map((e) => ({ ...e, bufferPercent: e.bufferPercent ?? 7.5, expectedReturns: e.expectedReturns ?? 12 }))
      : Array.from({ length: childCount }, (_, i) => ({
          label: `Child ${i + 1} Marriage`,
          marriageCostCurrent: 0,
          yearsRemaining: 10,
          expectedInflationYearly: 5,
          bufferPercent: 7.5,
          expectedReturns: 12,
        }))
  }, [childCount, existing])

  const entryViews: MarriageEntryViewData[] = useMemo(() =>
    entries.map((entry, idx) => {
      const buffer = entry.bufferPercent ?? 7.5
      const expRet = entry.expectedReturns ?? 12
      const result = computeMarriageCorpus(
        entry.marriageCostCurrent,
        entry.expectedInflationYearly / 100,
        entry.yearsRemaining,
        expRet / 100,
        buffer / 100,
      )
      return {
        entry, index: idx, buffer, expRet,
        targetCorpus: result.targetCorpus,
        inflatedCorpus: result.inflatedCorpus,
        lumpsumNeeded: result.lumpsumNeeded,
        sipNeeded: result.sipNeeded,
      }
    }), [entries])

  function updateEntry(index: number, patch: Partial<MarriageGoalEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ marriage: updated })
  }

  function addEntry() {
    updateGoalDetails({
      marriage: [
        ...entries,
        { label: "", marriageCostCurrent: 0, yearsRemaining: 10, expectedInflationYearly: 5, bufferPercent: 7.5, expectedReturns: 12 },
      ],
    })
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return
    updateGoalDetails({ marriage: entries.filter((_, i) => i !== index) })
  }

  return { entryViews, updateEntry, addEntry, removeEntry, canRemove: entries.length > 1 }
}
