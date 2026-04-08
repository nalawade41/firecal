import type {
  StepProps,
  GoalDetails,
  OnboardingData,
  FireGoalDetails,
  SchoolFeesChild,
  GraduationGoalEntry,
  MarriageGoalEntry,
  HouseDownPaymentGoalDetails,
  WhitegoodsItem,
  CustomGoalDetailEntry,
} from "@/types/onboarding"

export interface TabProps {
  data: StepProps["data"]
  updateGoalDetails: (updates: Partial<GoalDetails>) => void
  updateData?: (updates: Partial<OnboardingData>) => void
}

export interface UseFireTabReturn {
  fire: FireGoalDetails
  update: (patch: Partial<FireGoalDetails>) => void
  model: "finite" | "perpetual"
  swr: number
  postRetReturn: number
  preRetReturn: number
  yearsToFire: number
  yearsInRetirement: number
  lifeExpectancy: number
  selectedCorpus: number
  selectedLumpsum: number
  selectedSip: number
  safeCorpus: number
  safeLumpsum: number
  safeSip: number
  swrWarning: string | null
}

export interface SchoolFeeChildViewData {
  child: SchoolFeesChild
  index: number
  yearsUntilSchoolStarts: number
  hikeEvery: number
  totalYears: number
  expReturns: number
  totalFeeOutflow: number
  totalLumpsumNeeded: number
  sipNeeded: number
  lumpsumEquity: number
  lumpsumDebt: number
  useDualBucket: boolean
  equityCount: number
  debtCount: number
  notInSchool: boolean
  returnPct: number
}

export interface UseSchoolFeesTabReturn {
  childViews: SchoolFeeChildViewData[]
  updateChild: (index: number, patch: Partial<SchoolFeesChild>) => void
}

export interface GraduationEntryViewData {
  entry: GraduationGoalEntry
  index: number
  horizon: number
  expRet: number
  targetCorpus: number
  lumpsumNeeded: number
  sipNeeded: number
}

export interface UseGraduationTabReturn {
  entryViews: GraduationEntryViewData[]
  updateEntry: (index: number, patch: Partial<GraduationGoalEntry>) => void
}

export interface MarriageEntryViewData {
  entry: MarriageGoalEntry
  index: number
  buffer: number
  expRet: number
  targetCorpus: number
  inflatedCorpus: number
  lumpsumNeeded: number
  sipNeeded: number
}

export interface UseMarriageTabReturn {
  entryViews: MarriageEntryViewData[]
  updateEntry: (index: number, patch: Partial<MarriageGoalEntry>) => void
  addEntry: () => void
  removeEntry: (index: number) => void
  canRemove: boolean
}

export interface UseHouseTabReturn {
  house: HouseDownPaymentGoalDetails
  update: (patch: Partial<HouseDownPaymentGoalDetails>) => void
  inflation: number
  expRet: number
  inflatedTarget: number
  lumpsum: number
  sip: number
}

export interface WhitegoodsItemViewData {
  item: WhitegoodsItem
  index: number
  expRet: number
  horizon: number
  inflatedCost: number
  lumpsum: number
  sip: number
}

export interface UseWhitegoodsTabReturn {
  itemViews: WhitegoodsItemViewData[]
  updateItem: (index: number, patch: Partial<WhitegoodsItem>) => void
  addItem: () => void
  removeItem: (index: number) => void
  canRemove: boolean
}

export interface CustomEntryViewData {
  defId: string
  defName: string
  entry: CustomGoalDetailEntry
  inflation: number
  expRet: number
  inflatedTarget: number
  lumpsum: number
  sip: number
}

export interface UseCustomTabReturn {
  entryViews: CustomEntryViewData[]
  updateEntry: (goalId: string, patch: Partial<CustomGoalDetailEntry>) => void
  isEmpty: boolean
}
