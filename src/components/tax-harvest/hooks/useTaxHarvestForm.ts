import { useState, useRef, useEffect, useCallback } from "react"
import type { Transaction, TaxHarvestInputs, AMC } from "@/types/tax-harvest"
import { getCurrentFinancialYear, parseAMCFile } from "@/engine/tax-harvest/calculator"
import { fetchSchemeList, filterSchemesByAmc, fetchLatestNav, type MFScheme, clearMfApiCache } from "@/services/mf-api"

export function useTaxHarvestForm(onCalculate: (inputs: TaxHarvestInputs) => void) {
  const { start: fyStart, end: fyEnd } = getCurrentFinancialYear()

  // Fund info
  const [fundName, setFundName] = useState("")
  const [schemeCode, setSchemeCode] = useState("")
  const [amc, setAmc] = useState<AMC>("sbi")
  const [currentNav, setCurrentNav] = useState(0)

  // Tax settings
  const [ltcgLimit, setLtcgLimit] = useState(125000)
  const [alreadyRealizedLTCG, setAlreadyRealizedLTCG] = useState(0)
  const [alreadyRealizedSTCG, setAlreadyRealizedSTCG] = useState(0)
  const [exitLoadMonths, setExitLoadMonths] = useState(12)
  const [exitLoadPercent, setExitLoadPercent] = useState(1)
  const [longTermMonths, setLongTermMonths] = useState(12)
  const [fyStartDate, setFyStartDate] = useState(fyStart.toISOString().split("T")[0])
  const [fyEndDate, setFyEndDate] = useState(fyEnd.toISOString().split("T")[0])

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // MF API states
  const [schemes, setSchemes] = useState<MFScheme[]>([])
  const [filteredSchemes, setFilteredSchemes] = useState<MFScheme[]>([])
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false)
  const [isLoadingNav, setIsLoadingNav] = useState(false)
  const [schemeError, setSchemeError] = useState<string | null>(null)
  const [navError, setNavError] = useState<string | null>(null)

  // Searchable dropdown
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch schemes on mount
  useEffect(() => {
    async function loadSchemes() {
      setIsLoadingSchemes(true)
      setSchemeError(null)
      try {
        const allSchemes = await fetchSchemeList()
        setSchemes(allSchemes)
        const amcSchemes = filterSchemesByAmc(allSchemes, "sbi")
        setFilteredSchemes(amcSchemes)
      } catch {
        setSchemeError("Failed to load fund list. Please try again.")
      } finally {
        setIsLoadingSchemes(false)
      }
    }
    loadSchemes()
  }, [])

  // Filter schemes when AMC changes
  useEffect(() => {
    if (schemes.length > 0) {
      const amcSchemes = filterSchemesByAmc(schemes, amc)
      setFilteredSchemes(amcSchemes)
      setFundName("")
      setSchemeCode("")
      setCurrentNav(0)
      setNavError(null)
    }
  }, [amc, schemes])

  const handleFundChange = useCallback(async (schemeName: string, code: string) => {
    setFundName(schemeName)
    setSchemeCode(code)
    setNavError(null)

    if (!code) {
      setCurrentNav(0)
      return
    }

    setIsLoadingNav(true)
    try {
      const nav = await fetchLatestNav(code)
      setCurrentNav(nav)
    } catch {
      setNavError("Failed to fetch NAV. Please enter manually.")
      setCurrentNav(0)
    } finally {
      setIsLoadingNav(false)
    }
  }, [])

  const handleRefreshSchemes = useCallback(async () => {
    clearMfApiCache()
    setIsLoadingSchemes(true)
    setSchemeError(null)
    try {
      const allSchemes = await fetchSchemeList()
      setSchemes(allSchemes)
      const amcSchemes = filterSchemesByAmc(allSchemes, amc)
      setFilteredSchemes(amcSchemes)
      setFundName("")
      setSchemeCode("")
      setCurrentNav(0)
    } catch {
      setSchemeError("Failed to reload fund list. Please try again.")
    } finally {
      setIsLoadingSchemes(false)
    }
  }, [amc])

  function addTransaction() {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date(),
      type: "buy",
      units: 0,
      navPerUnit: 0,
      amount: 0,
    }
    setTransactions(prev => [...prev, newTx])
  }

  function removeTransaction(index: number) {
    setTransactions(prev => prev.filter((_, i) => i !== index))
  }

  function updateTransaction(index: number, field: keyof Transaction, value: unknown) {
    setTransactions(prev => prev.map((tx, i) => {
      if (i !== index) return tx

      const updated = { ...tx, [field]: value }

      if ((field === "units" || field === "navPerUnit") && updated.units && updated.navPerUnit) {
        updated.amount = updated.units * updated.navPerUnit
      }

      return updated
    }))
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const parsedTransactions = await parseAMCFile(file, amc)
      const txsWithFund = parsedTransactions.map(tx => ({
        ...tx,
        fundName: fundName || tx.fundName,
      }))
      setTransactions(prev => [...prev, ...txsWithFund])
    } catch (error) {
      alert(`Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    e.target.value = ""
  }

  function handleCalculate() {
    if (!fundName || currentNav <= 0) {
      alert("Please enter fund name and current NAV")
      return
    }

    if (transactions.length === 0) {
      alert("Please add at least one transaction")
      return
    }

    const inputs: TaxHarvestInputs = {
      fundName,
      amc,
      currentNav,
      fyStartDate: new Date(fyStartDate),
      fyEndDate: new Date(fyEndDate),
      ltcgExemptionLimit: ltcgLimit,
      alreadyRealizedLTCG,
      alreadyRealizedSTCG,
      transactions,
      exitLoadPeriodMonths: exitLoadMonths,
      exitLoadPercent,
      longTermPeriodMonths: longTermMonths,
    }

    onCalculate(inputs)
  }

  return {
    // Fund info
    amc,
    schemeCode,
    currentNav,
    isLoadingSchemes,
    isLoadingNav,
    schemeError,
    navError,
    filteredSchemes,
    searchQuery,
    isDropdownOpen,
    dropdownRef,
    onAmcChange: setAmc,
    onFundChange: handleFundChange,
    onNavChange: setCurrentNav,
    onRefreshSchemes: handleRefreshSchemes,
    onSearchQueryChange: setSearchQuery,
    onToggleDropdown: () => setIsDropdownOpen(prev => !prev),
    onCloseDropdown: () => setIsDropdownOpen(false),

    // Tax settings
    fyStartDate,
    fyEndDate,
    ltcgLimit,
    alreadyRealizedLTCG,
    alreadyRealizedSTCG,
    longTermMonths,
    exitLoadMonths,
    exitLoadPercent,
    onFyStartDateChange: setFyStartDate,
    onFyEndDateChange: setFyEndDate,
    onLtcgLimitChange: setLtcgLimit,
    onAlreadyRealizedLTCGChange: setAlreadyRealizedLTCG,
    onAlreadyRealizedSTCGChange: setAlreadyRealizedSTCG,
    onLongTermMonthsChange: setLongTermMonths,
    onExitLoadMonthsChange: setExitLoadMonths,
    onExitLoadPercentChange: setExitLoadPercent,

    // Transactions
    transactions,
    fileInputRef,
    onAddTransaction: addTransaction,
    onRemoveTransaction: removeTransaction,
    onUpdateTransaction: updateTransaction,
    onFileImport: handleFileImport,
    onCalculate: handleCalculate,
  }
}
