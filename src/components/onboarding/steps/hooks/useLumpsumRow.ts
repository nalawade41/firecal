import { useState, useMemo } from "react"
import type { MFScheme } from "@/services/mf-api"
import type { LumpsumRowProps, UseLumpsumRowReturn } from "../types/Steps.types"

export function useLumpsumRow({ entry, index, allSchemes, onFundSelect, onUpdate, onCalculateUnits, calculatingUnits }: LumpsumRowProps): UseLumpsumRowReturn {
  const [fundSearch, setFundSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)

  const canCalculateUnits = entry.amount > 0 && !!entry.dateOfInvestment && !!entry.schemeCode && !calculatingUnits

  function handleCalculateClick() {
    if (!canCalculateUnits) return
    setCalcError(null)
    onCalculateUnits(index, entry.schemeCode, entry.amount, entry.dateOfInvestment)
      .catch((err: Error) => {
        setCalcError(err.message || "Failed to calculate units")
      })
  }

  const filteredFunds: MFScheme[] = useMemo(() => {
    if (!fundSearch || allSchemes.length === 0) return []
    const q = fundSearch.toLowerCase()
    return allSchemes.filter((s) => s.schemeName.toLowerCase().includes(q)).slice(0, 50)
  }, [fundSearch, allSchemes])

  function handleChangeFund() {
    onUpdate(index, { schemeCode: "", fundName: "", amc: "" })
    setFundSearch("")
  }

  function handleSelectScheme(scheme: MFScheme) {
    onFundSelect(index, scheme)
    setShowDropdown(false)
    setFundSearch("")
  }

  return {
    fundSearch, setFundSearch,
    showDropdown, setShowDropdown,
    calcError, canCalculateUnits, handleCalculateClick,
    filteredFunds, handleChangeFund, handleSelectScheme,
  }
}
