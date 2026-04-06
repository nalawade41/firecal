import type { StepProps, GoalType, GoalDetails, OtherAssets, LumpsumEntry, SipEntry } from "@/types/onboarding"
import type { MFScheme } from "@/services/mf-api"
import type { buildGoalOptions } from "@/lib/utils"

export interface UseStepGoalDetailsReturn {
  activeGoals: GoalType[]
  resolvedTab: string
  setActiveTab: (tab: string) => void
  updateGoalDetails: (updates: Partial<GoalDetails>) => void
  isEmpty: boolean
  currentIdx: number
  tabConfig: { emoji: string; label: string } | undefined
}

export interface UseStepExpensesReturn {
  update: <K extends keyof StepProps["data"]["expenses"]>(key: K, value: StepProps["data"]["expenses"][K]) => void
  corpusRequired: number
  expenseAtRetirement: number
  swrUsed: number
}

export interface UseStepGoalSelectionReturn {
  showCustomPopup: boolean
  setShowCustomPopup: (v: boolean) => void
  customName: string
  setCustomName: (v: string) => void
  customIcon: string
  setCustomIcon: (v: string) => void
  toggleGoal: (type: GoalType) => void
  toggleCustomGoal: (id: string) => void
  handleAddCustomGoal: () => void
  isSelected: (type: GoalType) => boolean
  canAddCustom: boolean
}

export interface UseStepProfileReturn {
  update: <K extends keyof StepProps["data"]["profile"]>(key: K, value: StepProps["data"]["profile"][K]) => void
}

export interface UseStepInvestmentsReturn {
  update: <K extends keyof StepProps["data"]["investments"]>(key: K, value: StepProps["data"]["investments"][K]) => void
}

export interface UseStepOtherAssetsReturn {
  assets: OtherAssets
  update: (patch: Partial<OtherAssets>) => void
}

export interface UseStepLumpsumReturn {
  entries: LumpsumEntry[]
  goalOptions: ReturnType<typeof buildGoalOptions>
  groups: string[]
  allSchemes: MFScheme[]
  schemesLoading: boolean
  schemesError: string | null
  calculatingIndex: number | null
  updateEntry: (index: number, patch: Partial<LumpsumEntry>) => void
  addEntry: () => void
  removeEntry: (index: number) => void
  handleFundSelect: (idx: number, scheme: MFScheme) => Promise<void>
  handleCalculateUnits: (index: number, schemeCode: string, amount: number, date: string) => Promise<void>
}

export interface UseStepSipReturn {
  entries: SipEntry[]
  goalOptions: ReturnType<typeof buildGoalOptions>
  groups: string[]
  allSchemes: MFScheme[]
  schemesLoading: boolean
  schemesError: string | null
  updateEntry: (index: number, patch: Partial<SipEntry>) => void
  addEntry: () => void
  removeEntry: (index: number) => void
  handleFundSelect: (idx: number, scheme: MFScheme) => Promise<void>
}

export interface UseStepConfirmationReturn {
  allGoalNames: string[]
  downloadJSON: () => void
}

export interface UseLumpsumRowReturn {
  fundSearch: string
  setFundSearch: (v: string) => void
  showDropdown: boolean
  setShowDropdown: (v: boolean) => void
  calcError: string | null
  canCalculateUnits: boolean
  handleCalculateClick: () => void
  filteredFunds: MFScheme[]
  handleChangeFund: () => void
  handleSelectScheme: (scheme: MFScheme) => void
}

export interface UseSipRowReturn {
  fundSearch: string
  setFundSearch: (v: string) => void
  showDropdown: boolean
  setShowDropdown: (v: boolean) => void
  filteredFunds: MFScheme[]
  handleChangeFund: () => void
  handleSelectScheme: (scheme: MFScheme) => void
}

export interface LumpsumRowProps {
  entry: LumpsumEntry
  index: number
  groups: string[]
  goalOptions: ReturnType<typeof buildGoalOptions>
  allSchemes: MFScheme[]
  onFundSelect: (idx: number, scheme: MFScheme) => Promise<void>
  onUpdate: (idx: number, patch: Partial<LumpsumEntry>) => void
  onRemove: (idx: number) => void
  onCalculateUnits: (idx: number, schemeCode: string, amount: number, date: string) => Promise<void>
  calculatingUnits: boolean
}

export interface SipRowProps {
  entry: SipEntry
  index: number
  groups: string[]
  goalOptions: ReturnType<typeof buildGoalOptions>
  allSchemes: MFScheme[]
  onFundSelect: (idx: number, scheme: MFScheme) => Promise<void>
  onUpdate: (idx: number, patch: Partial<SipEntry>) => void
  onRemove: (idx: number) => void
}
