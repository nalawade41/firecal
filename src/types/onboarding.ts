// ── Step metadata ─────────────────────────────────────────
export interface OnboardingStepMeta {
  id: string
  title: string
  description: string
}

// ── Step 1: Profile ───────────────────────────────────────
export interface OnboardingProfile {
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  numberOfChildren: number
}

// ── Step 2: Expenses ──────────────────────────────────────
export interface OnboardingExpenses {
  annualHouseholdExpense: number
  expenseInflationPercent: number
  retirementAdjustmentFactor: number
}

// ── Step 3: Current Investments ───────────────────────────
export interface OnboardingInvestments {
  mfPortfolio: number
  nps: number
  epf: number
  ppf: number
  goldGrams: number
  silverGrams: number
  emergencyFund: number
  savingsAccountBalance: number
  otherAmount: number
}

// ── Step 4: Goal Selection ────────────────────────────────
export type GoalType =
  | "fire"
  | "school-fees"
  | "graduation"
  | "marriage"
  | "house-down-payment"
  | "whitegoods"
  | "custom"

export interface CustomGoalDefinition {
  id: string
  name: string
  icon: string
}

// ── Step 5: Goal Details ──────────────────────────────────
export type FireModel = "finite" | "perpetual"

export interface FireGoalDetails {
  targetAge: number
  safeWithdrawalRate: number
  inflationAssumed: number
  postRetirementReturn: number
  fireModel: FireModel
  expectedReturns: number
}

export interface SchoolFeesChild {
  label: string
  childCurrentAge: number
  schoolStartingAge: number
  currentSchoolFeeYearly: number
  expectedInflationYearly: number
  feeHikeEveryNYears: number
  totalSchoolYears: number
  expectedReturns: number
}

export interface GraduationGoalEntry {
  label: string
  graduationCostCurrent: number
  expectedInflationYearly: number
  horizonYears: number
  expectedReturns: number
}

export interface MarriageGoalEntry {
  label: string
  marriageCostCurrent: number
  yearsRemaining: number
  expectedInflationYearly: number
  bufferPercent: number
  expectedReturns: number
}

export interface HouseDownPaymentGoalDetails {
  targetCost: number
  yearsRemaining: number
  inflationExpected: number
  expectedReturns: number
}

export interface WhitegoodsItem {
  itemName: string
  currentCost: number
  inflationExpected: number
  replacementFrequencyYears: number
  expectedReturns: number
}

export interface CustomGoalDetailEntry {
  goalId: string
  targetCost: number
  yearsRemaining: number
  inflationExpected: number
  expectedReturns: number
}

export interface GoalDetails {
  fire?: FireGoalDetails
  schoolFees?: SchoolFeesChild[]
  graduation?: GraduationGoalEntry[]
  marriage?: MarriageGoalEntry[]
  houseDownPayment?: HouseDownPaymentGoalDetails
  whitegoods?: WhitegoodsItem[]
  custom?: CustomGoalDetailEntry[]
}

// ── Step 6: Lumpsum Investments ───────────────────────────
export interface LumpsumEntry {
  id: string
  amc: string
  schemeCode: string
  fundName: string
  amount: number
  dateOfInvestment: string
  units: number
  goalId: string
  folioNumber: string
}

// ── Step 7: SIP Investments ───────────────────────────────
export interface SipEntry {
  id: string
  amc: string
  schemeCode: string
  fundName: string
  amount: number
  startDate: string
  unitsTillNow: number
  goalId: string
  folioNumber: string
  isActive: boolean
  endDate: string
}

// ── Step 8: Other Assets ──────────────────────────────────
export interface OtherAssets {
  epf: { currentBalance: number; monthlyContribution: number; yearsToContinue: number }
  nps: { currentBalance: number; yearlyContribution: number; yearsToContinue: number }
  goldGrams: number
  silverGrams: number
  emergencyFund: number
  otherSavings: number
}

// ── Full onboarding data ──────────────────────────────────
export interface OnboardingData {
  profile: OnboardingProfile
  expenses: OnboardingExpenses
  investments: OnboardingInvestments
  selectedGoals: GoalType[]
  customGoalDefinitions: CustomGoalDefinition[]
  goalDetails: GoalDetails
  lumpsumInvestments: LumpsumEntry[]
  sipInvestments: SipEntry[]
  otherAssets: OtherAssets
}

// ── Shared step props ─────────────────────────────────────
export interface StepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

// ── Default data ──────────────────────────────────────────
export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  profile: {
    currentAge: 35,
    retirementAge: 45,
    lifeExpectancy: 90,
    numberOfChildren: 0,
  },
  expenses: {
    annualHouseholdExpense: 100000,
    expenseInflationPercent: 6,
    retirementAdjustmentFactor: 1,
  },
  investments: {
    mfPortfolio: 0,
    nps: 0,
    epf: 0,
    ppf: 0,
    goldGrams: 0,
    silverGrams: 0,
    emergencyFund: 0,
    savingsAccountBalance: 0,
    otherAmount: 0,
  },
  selectedGoals: [],
  customGoalDefinitions: [],
  goalDetails: {},
  lumpsumInvestments: [],
  sipInvestments: [],
  otherAssets: {
    epf: { currentBalance: 0, monthlyContribution: 0, yearsToContinue: 0 },
    nps: { currentBalance: 0, yearlyContribution: 0, yearsToContinue: 0 },
    goldGrams: 0,
    silverGrams: 0,
    emergencyFund: 0,
    otherSavings: 0,
  },
}
