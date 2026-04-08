import type { TaxHarvestInputs, Transaction, AMC } from "@/types/tax-harvest"
import type { MFScheme } from "@/services/mf-api"

export interface TaxHarvestFormProps {
  onCalculate: (inputs: TaxHarvestInputs) => void
}

export interface FundInfoSectionProps {
  amc: AMC
  schemeCode: string
  currentNav: number
  isLoadingSchemes: boolean
  isLoadingNav: boolean
  schemeError: string | null
  navError: string | null
  filteredSchemes: MFScheme[]
  searchQuery: string
  isDropdownOpen: boolean
  dropdownRef: React.RefObject<HTMLDivElement | null>
  onAmcChange: (amc: AMC) => void
  onFundChange: (schemeName: string, code: string) => void
  onNavChange: (nav: number) => void
  onRefreshSchemes: () => void
  onSearchQueryChange: (query: string) => void
  onToggleDropdown: () => void
  onCloseDropdown: () => void
}

export interface TaxSettingsSectionProps {
  fyStartDate: string
  fyEndDate: string
  ltcgLimit: number
  alreadyRealizedLTCG: number
  alreadyRealizedSTCG: number
  longTermMonths: number
  exitLoadMonths: number
  exitLoadPercent: number
  onFyStartDateChange: (date: string) => void
  onFyEndDateChange: (date: string) => void
  onLtcgLimitChange: (value: number) => void
  onAlreadyRealizedLTCGChange: (value: number) => void
  onAlreadyRealizedSTCGChange: (value: number) => void
  onLongTermMonthsChange: (value: number) => void
  onExitLoadMonthsChange: (value: number) => void
  onExitLoadPercentChange: (value: number) => void
}

export interface TransactionsSectionProps {
  transactions: Transaction[]
  amc: AMC
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onAddTransaction: () => void
  onRemoveTransaction: (index: number) => void
  onUpdateTransaction: (index: number, field: keyof Transaction, value: unknown) => void
  onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCalculate: () => void
}

export interface TransactionRowProps {
  transaction: Transaction
  index: number
  onUpdate: (index: number, field: keyof Transaction, value: unknown) => void
  onRemove: (index: number) => void
}
