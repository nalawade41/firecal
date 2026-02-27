// ============================================================
// INPUT TYPES — User-configurable parameters
// ============================================================

export interface BaseProfile {
  currentYear: number
  currentAge: number
  retirementAge: number
  lifeExpectancyAge: number
  numberOfKids: number
}

export interface ExpenseProfile {
  currentAnnualHouseholdExpense: number
  expenseInflationPercent: number
  expenseAdjustmentFactorAtRetirement: number // default 1.0
}

export interface InvestmentProfile {
  currentPortfolioValue: number
  annualSavings: number
  annualSavingsIncreasePercent: number // default 0
}

export interface ChildProfile {
  currentAge: number
  schoolStartAge: number
  graduationStartAge: number
  postGraduationStartAge: number
  marriageAge: number
}

export interface EducationParameters {
  school: {
    currentAnnualFee: number
    inflationPercent: number
    durationYears: number
  }
  graduation: {
    currentTotalCost: number
    inflationPercent: number
    durationYears: number
  }
  postGraduation: {
    currentTotalCost: number
    inflationPercent: number
    durationYears: number
  }
}

export interface MarriageParameters {
  currentCostPerChild: number
  inflationPercent: number
}

export interface WhitegoodsItem {
  itemName: string
  currentCost: number
  replacementFrequencyYears: number
  inflationPercent: number
}

export interface TravelParameters {
  currentAnnualCost: number
  inflationPercent: number
  stopAge: number
}

export interface HealthcareParameters {
  currentAnnualMedicalExpense: number
  medicalInflationPercent: number
  currentInsurancePremium: number
  insurancePremiumInflationPercent: number
}

export interface GlidepathCheckpoint {
  age: number
  equityPercent: number // 0–100
}

export interface GoalInvestmentProfile {
  equityReturnPercent: number
  debtReturnPercent: number
  equityPercent: number   // 0–100
  debtPercent: number     // 0–100 (should equal 100 - equityPercent)
}

export interface FireAssumptions {
  safeWithdrawalRatePercent: number
  expectedEquityReturnPercent: number
  expectedDebtReturnPercent: number
  glidepathCheckpoints: GlidepathCheckpoint[]
  goalInvestment: GoalInvestmentProfile
}

/** Top-level input object combining all user inputs */
export interface FireInputs {
  baseProfile: BaseProfile
  expenseProfile: ExpenseProfile
  investmentProfile: InvestmentProfile
  children: ChildProfile[]
  educationParameters: EducationParameters
  marriageParameters: MarriageParameters
  whitegoods: WhitegoodsItem[]
  travelParameters: TravelParameters
  healthcareParameters: HealthcareParameters
  fireAssumptions: FireAssumptions
}

// ============================================================
// OUTPUT TYPES — System-generated calculation results
// ============================================================

export interface TimelineYear {
  yearIndex: number
  calendarYear: number
  userAge: number
  isRetired: boolean
  yearsToRetirement: number
  yearsInRetirement: number
  childAges: number[]
}

export interface EducationYearResult {
  childIndex: number
  schoolCost: number
  graduationCost: number
  postGraduationCost: number
  totalCost: number
}

export interface YearlyEducationResult {
  perChild: EducationYearResult[]
  totalEducationCost: number
}

export interface MarriageYearResult {
  childIndex: number
  cost: number
}

export interface YearlyMarriageResult {
  perChild: MarriageYearResult[]
  totalMarriageCost: number
}

export interface WhitegoodsYearResult {
  itemName: string
  cost: number
}

export interface YearlyWhitegoodsResult {
  perItem: WhitegoodsYearResult[]
  totalWhitegoodsCost: number
}

export interface YearlyHealthcareResult {
  medicalCost: number
  insuranceCost: number
  totalHealthcareCost: number
}

export interface YearlyPortfolioResult {
  openingBalance: number
  contribution: number
  withdrawal: number
  equityPercent: number
  debtPercent: number
  blendedReturn: number
  returnAmount: number
  closingBalance: number
  isDepleted: boolean
}

export interface YearlyExpenseResult {
  livingExpense: number
  educationCost: number
  marriageCost: number
  whitegoodsCost: number
  travelCost: number
  healthcareCost: number
  totalExpense: number
  withdrawalAmount: number // 0 pre-retirement, totalExpense post-retirement
}

export interface SimulatedPortfolioYear {
  openingBalance: number
  contribution: number
  withdrawal: number
  returnPercent: number
  returnAmount: number
  closingBalance: number
  isDepleted: boolean
}

export interface YearResult {
  timeline: TimelineYear
  education: YearlyEducationResult
  marriage: YearlyMarriageResult
  whitegoods: YearlyWhitegoodsResult
  travel: number
  healthcare: YearlyHealthcareResult
  expense: YearlyExpenseResult
  portfolio: YearlyPortfolioResult
  bucketPortfolios: Record<string, SimulatedPortfolioYear>
}

// ============================================================
// GOAL BUCKET TYPES — Granular per-item planning
// ============================================================

export type GoalCategory =
  | "education"
  | "marriage"
  | "healthcare"
  | "whitegoods"
  | "travel"
  | "living"

export interface GoalBucketCashflow {
  yearFromNow: number
  amount: number
}

export interface GoalBucket {
  category: GoalCategory
  label: string
  sublabel: string
  presentCost: number
  futureCost: number
  yearsToGoal: number
  expectedReturnPercent: number
  lumpsumToday: number
  monthlySip: number
  cashflows: GoalBucketCashflow[]
}

export interface GoalCategorySummary {
  category: GoalCategory
  label: string
  buckets: GoalBucket[]
  totalPresentCost: number
  totalFutureCost: number
  totalLumpsumToday: number
  totalMonthlySip: number
}

export interface SummaryResult {
  goalCategories: GoalCategorySummary[]
  retirementLivingCorpus: number
  totalGoalCorpus: number
  totalGoalLumpsumToday: number
  totalRequiredCorpus: number
  portfolioAtRetirement: number
  corpusGap: number
  goalCorpusGap: number
  livingCorpusGap: number
  totalMonthlySipRequired: number
  totalAnnualSipRequired: number
  longestGoalHorizonYears: number
  portfolioSurvival: PortfolioSurvivalResult
}

export interface PortfolioSurvivalResult {
  survived: boolean
  depletionYear: number | null
  depletionAge: number | null
  finalBalance: number
}

/** Top-level output combining summary + year-by-year details */
export interface FireResults {
  summary: SummaryResult
  yearByYear: YearResult[]
}
