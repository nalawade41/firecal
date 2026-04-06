import { useState } from "react"
import type { StepProps, LumpsumEntry } from "@/types/onboarding"
import type { MFScheme } from "@/services/mf-api"
import { buildGoalOptions } from "@/lib/utils"
import { useMfSchemes } from "@/hooks/useMfSchemes"
import { calculateLumpsumUnits } from "@/services/mf-api"
import type { UseStepLumpsumReturn } from "../types/Steps.types"

function newEntry(): LumpsumEntry {
  return { id: `ls-${Date.now()}`, amc: "", schemeCode: "", fundName: "", amount: 0, dateOfInvestment: "", units: 0, goalId: "", folioNumber: "" }
}

export function useStepLumpsum({ data, updateData }: StepProps): UseStepLumpsumReturn {
  const entries = data.lumpsumInvestments
  const goalOptions = buildGoalOptions(data)
  const groups = [...new Set(goalOptions.map((o) => o.group))]
  const { allSchemes, loading: schemesLoading, error: schemesError, fetchNav } = useMfSchemes()
  const [calculatingIndex, setCalculatingIndex] = useState<number | null>(null)

  function updateEntry(index: number, patch: Partial<LumpsumEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateData({ lumpsumInvestments: updated })
  }

  async function handleCalculateUnits(index: number, schemeCode: string, amount: number, date: string) {
    setCalculatingIndex(index)
    try {
      const { units, actualDate } = await calculateLumpsumUnits(schemeCode, amount, date)
      updateEntry(index, { units, dateOfInvestment: actualDate })
    } finally {
      setCalculatingIndex(null)
    }
  }

  function addEntry() {
    updateData({ lumpsumInvestments: [...entries, newEntry()] })
  }

  function removeEntry(index: number) {
    updateData({ lumpsumInvestments: entries.filter((_, i) => i !== index) })
  }

  async function handleFundSelect(idx: number, scheme: MFScheme) {
    updateEntry(idx, { schemeCode: scheme.schemeCode, fundName: scheme.schemeName, amc: scheme.fundHouse })
    try {
      await fetchNav(scheme.schemeCode)
    } catch {
      // NAV fetch failed silently — will retry later
    }
  }

  return {
    entries, goalOptions, groups, allSchemes,
    schemesLoading, schemesError, calculatingIndex,
    updateEntry, addEntry, removeEntry,
    handleFundSelect, handleCalculateUnits,
  }
}
