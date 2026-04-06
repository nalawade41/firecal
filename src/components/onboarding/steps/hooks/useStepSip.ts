import type { StepProps, SipEntry } from "@/types/onboarding"
import type { MFScheme } from "@/services/mf-api"
import { buildGoalOptions } from "@/lib/utils"
import { useMfSchemes } from "@/hooks/useMfSchemes"
import type { UseStepSipReturn } from "../types/Steps.types"

function newSip(): SipEntry {
  return { id: `sip-${Date.now()}`, amc: "", schemeCode: "", fundName: "", amount: 0, startDate: "", unitsTillNow: 0, goalId: "", folioNumber: "", isActive: true, endDate: "" }
}

export function useStepSip({ data, updateData }: StepProps): UseStepSipReturn {
  const entries = data.sipInvestments
  const goalOptions = buildGoalOptions(data)
  const groups = [...new Set(goalOptions.map((o) => o.group))]
  const { allSchemes, loading: schemesLoading, error: schemesError, fetchNav } = useMfSchemes()

  function updateEntry(index: number, patch: Partial<SipEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateData({ sipInvestments: updated })
  }

  function addEntry() {
    updateData({ sipInvestments: [...entries, newSip()] })
  }

  function removeEntry(index: number) {
    updateData({ sipInvestments: entries.filter((_, i) => i !== index) })
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
    schemesLoading, schemesError,
    updateEntry, addEntry, removeEntry, handleFundSelect,
  }
}
