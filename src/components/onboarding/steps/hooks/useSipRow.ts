import { useState, useMemo } from "react"
import type { MFScheme } from "@/services/mf-api"
import type { SipRowProps, UseSipRowReturn } from "../types/Steps.types"

export function useSipRow({ index, allSchemes, onFundSelect, onUpdate }: SipRowProps): UseSipRowReturn {
  const [fundSearch, setFundSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

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
    filteredFunds, handleChangeFund, handleSelectScheme,
  }
}
