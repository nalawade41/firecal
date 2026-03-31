import { useState, useRef, useEffect, useCallback } from "react"
import type { Transaction, TaxHarvestInputs, AMC } from "@/types/tax-harvest"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberField } from "@/components/ui/number-field"
import { Plus, Trash2, Upload, Calculator, Loader2, ChevronDown, Search } from "lucide-react"
import { getCurrentFinancialYear, parseCSVTransactions } from "@/engine/tax-harvest/calculator"
import { fetchSchemeList, filterSchemesByAmc, fetchLatestNav, type MFScheme, clearMfApiCache } from "@/services/mf-api"

/**
 * Format scheme name to title case for better readability
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Keep common abbreviations uppercase
      const abbreviations = ['sbi', 'hdfc', 'icici', 'uti', 'lic', 'idfc', 'dsp', 'tata', 'l&t', 'navi', 'stcg', 'ltcg', 'etf', 'gold', 'ppfas', 'elss', 'fof', 'sip', 'swp', 'stp']
      if (abbreviations.includes(word)) {
        return word.toUpperCase()
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

interface TaxHarvestInputFormProps {
  onCalculate: (inputs: TaxHarvestInputs) => void
}

export function TaxHarvestInputForm({ onCalculate }: TaxHarvestInputFormProps) {
  const { start: fyStart, end: fyEnd } = getCurrentFinancialYear()
  
  const [fundName, setFundName] = useState("")
  const [schemeCode, setSchemeCode] = useState<string>("")
  const [amc, setAmc] = useState<AMC>("sbi")
  const [currentNav, setCurrentNav] = useState(0)
  const [ltcgLimit, setLtcgLimit] = useState(125000)
  const [alreadyRealizedLTCG, setAlreadyRealizedLTCG] = useState(0)
  const [alreadyRealizedSTCG, setAlreadyRealizedSTCG] = useState(0)
  const [exitLoadMonths, setExitLoadMonths] = useState(12)
  const [exitLoadPercent, setExitLoadPercent] = useState(1)
  const [longTermMonths, setLongTermMonths] = useState(12)
  const [fyStartDate, setFyStartDate] = useState(fyStart.toISOString().split("T")[0])
  const [fyEndDate, setFyEndDate] = useState(fyEnd.toISOString().split("T")[0])
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // MF API states
  const [schemes, setSchemes] = useState<MFScheme[]>([])
  const [filteredSchemes, setFilteredSchemes] = useState<MFScheme[]>([])
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false)
  const [isLoadingNav, setIsLoadingNav] = useState(false)
  const [schemeError, setSchemeError] = useState<string | null>(null)
  const [navError, setNavError] = useState<string | null>(null)
  
  // Searchable dropdown states
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch schemes on component mount
  useEffect(() => {
    async function loadSchemes() {
      setIsLoadingSchemes(true)
      setSchemeError(null)
      try {
        const allSchemes = await fetchSchemeList()
        setSchemes(allSchemes)
        // Filter for current AMC
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

  // Update filtered schemes when AMC changes
  useEffect(() => {
    if (schemes.length > 0) {
      const amcSchemes = filterSchemesByAmc(schemes, amc)
      setFilteredSchemes(amcSchemes)
      // Reset fund selection when AMC changes
      setFundName("")
      setSchemeCode("")
      setCurrentNav(0)
      setNavError(null)
    }
  }, [amc, schemes])

  // Handle fund selection change
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

  // Function to clear cache and reload schemes
  const handleRefreshSchemes = useCallback(async () => {
    clearMfApiCache()
    setIsLoadingSchemes(true)
    setSchemeError(null)
    try {
      const allSchemes = await fetchSchemeList()
      setSchemes(allSchemes)
      const amcSchemes = filterSchemesByAmc(allSchemes, amc)
      setFilteredSchemes(amcSchemes)
      // Reset selection
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
    setTransactions([...transactions, newTx])
  }

  function removeTransaction(index: number) {
    setTransactions(transactions.filter((_, i) => i !== index))
  }

  function updateTransaction(index: number, field: keyof Transaction, value: unknown) {
    setTransactions(transactions.map((tx, i) => {
      if (i !== index) return tx
      
      const updated = { ...tx, [field]: value }
      
      // Auto-calculate amount if units and nav are provided
      if ((field === "units" || field === "navPerUnit") && updated.units && updated.navPerUnit) {
        updated.amount = updated.units * updated.navPerUnit
      }
      
      return updated
    }))
  }

  function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const csvText = ev.target?.result as string
        const parsedTransactions = parseCSVTransactions(csvText, amc)
        
        // Add fund name to transactions if available
        const txsWithFund = parsedTransactions.map(tx => ({
          ...tx,
          fundName: fundName || tx.fundName
        }))
        
        setTransactions([...transactions, ...txsWithFund])
      } catch {
        alert("Failed to parse CSV. Please check the format.")
      }
    }
    reader.readAsText(file)
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

  return (
    <div className="space-y-6">
      {/* Fund Info */}
      <div className="relative z-30 rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Fund Information</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Enter fund details and current NAV</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {schemeError && (
            <div className="col-span-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {schemeError}
            </div>
          )}
          <div className="space-y-2 min-w-0">
            <div className="flex items-center justify-between">
              <Label className="whitespace-nowrap">AMC (Fund House)</Label>
              <button
                type="button"
                onClick={handleRefreshSchemes}
                disabled={isLoadingSchemes}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                {isLoadingSchemes ? "Loading..." : "Refresh"}
              </button>
            </div>
            <select
              value={amc}
              onChange={(e) => setAmc(e.target.value as AMC)}
              className="w-full h-10 px-3 rounded-md border border-input bg-white/60 text-sm"
            >
              <option value="sbi">SBI Mutual Fund</option>
            </select>
          </div>
          <div className="space-y-2 min-w-0" ref={dropdownRef}>
            <Label>Fund Name</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoadingSchemes || filteredSchemes.length === 0}
                className="w-full h-10 px-3 rounded-md border border-input bg-white/60 disabled:bg-gray-100 flex items-center justify-between text-left text-sm"
              >
                <span className="truncate">
                  {schemeCode 
                    ? toTitleCase(filteredSchemes.find(s => s.schemeCode === schemeCode)?.schemeName || "")
                    : isLoadingSchemes 
                      ? "Loading funds..." 
                      : filteredSchemes.length === 0 
                        ? "No funds found" 
                        : "Select a fund"
                  }
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search funds..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="py-1">
                    {filteredSchemes
                      .filter(scheme => 
                        scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((scheme) => (
                        <button
                          key={scheme.schemeCode}
                          type="button"
                          onClick={() => {
                            handleFundChange(scheme.schemeName, scheme.schemeCode)
                            setIsDropdownOpen(false)
                            setSearchQuery("")
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                            schemeCode === scheme.schemeCode ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          {toTitleCase(scheme.schemeName)}
                        </button>
                      ))}
                    {filteredSchemes.filter(scheme => 
                      scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No funds found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <NumberField
              label="Current NAV"
              value={currentNav}
              onChange={setCurrentNav}
              suffix="₹"
              step={0.01}
            />
            {isLoadingNav && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Fetching NAV...
              </p>
            )}
            {navError && (
              <p className="text-xs text-red-600 mt-1">{navError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="relative z-20 rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Tax Settings</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Configure financial year and exemption limits</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>FY Start Date</Label>
            <Input
              type="date"
              value={fyStartDate}
              onChange={(e) => setFyStartDate(e.target.value)}
              className="bg-white/60 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>FY End Date</Label>
            <Input
              type="date"
              value={fyEndDate}
              onChange={(e) => setFyEndDate(e.target.value)}
              className="bg-white/60 text-sm"
            />
          </div>
          <NumberField
            label="LTCG Exemption Limit"
            value={ltcgLimit}
            onChange={setLtcgLimit}
            suffix="₹"
            step={1000}
          />
          <NumberField
            label="Already Realized LTCG"
            value={alreadyRealizedLTCG}
            onChange={setAlreadyRealizedLTCG}
            suffix="₹"
            step={1000}
          />
          <NumberField
            label="Already Realized STCG"
            value={alreadyRealizedSTCG}
            onChange={setAlreadyRealizedSTCG}
            suffix="₹"
            step={1000}
          />
          <NumberField
            label="Long-term Period"
            value={longTermMonths}
            onChange={setLongTermMonths}
            suffix="months"
            step={1}
            min={1}
          />
          <NumberField
            label="Exit Load Period"
            value={exitLoadMonths}
            onChange={setExitLoadMonths}
            suffix="months"
            step={1}
            min={0}
          />
          <NumberField
            label="Exit Load %"
            value={exitLoadPercent}
            onChange={setExitLoadPercent}
            suffix="%"
            step={0.01}
            min={0}
          />
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Transactions
              {transactions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({transactions.length} total)
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add buy, SIP, sell transactions or import from CSV
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/60"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addTransaction}
              className="bg-white/60"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Transaction
            </Button>
            <Button
              size="sm"
              onClick={handleCalculate}
              disabled={transactions.length === 0}
              className="px-4"
            >
              <Calculator className="h-4 w-4 mr-1" />
              Calculate
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions added yet. Add manually or import from CSV.
          </p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
            {transactions.map((tx, idx) => (
              <div
                key={tx.id}
                className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border border-white/40 bg-white/30"
              >
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={tx.date.toISOString().split("T")[0]}
                    onChange={(e) => updateTransaction(idx, "date", new Date(e.target.value))}
                    className="bg-white/60 h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    value={tx.type}
                    onChange={(e) => updateTransaction(idx, "type", e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-white/60 text-sm"
                  >
                    <option value="buy">Buy</option>
                    <option value="sip">SIP</option>
                    <option value="sell">Sell</option>
                    <option value="switch-in">Switch In</option>
                    <option value="switch-out">Switch Out</option>
                    <option value="bonus">Bonus</option>
                    <option value="dividend-reinvest">Div Reinvest</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Units</Label>
                  <Input
                    type="number"
                    value={tx.units || ""}
                    onChange={(e) => updateTransaction(idx, "units", parseFloat(e.target.value) || 0)}
                    step="0.001"
                    className="bg-white/60 h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Buy NAV</Label>
                  <Input
                    type="number"
                    value={tx.navPerUnit || ""}
                    onChange={(e) => updateTransaction(idx, "navPerUnit", parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="bg-white/60 h-8 text-sm"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Amount (Auto)</Label>
                  <Input
                    type="number"
                    value={tx.amount || ""}
                    readOnly
                    className="bg-white/40 h-8 text-sm text-muted-foreground"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTransaction(idx)}
                    className="text-destructive hover:text-destructive h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
