import type {
  FireInputs,
  FireResults,
  YearResult,
  YearlyExpenseResult,
  SummaryResult,
  PortfolioSurvivalResult,
  GoalBucket,
  GoalCategory,
  GoalCategorySummary,
  SimulatedPortfolioYear,
} from "@/types"
import { generateTimeline } from "./timeline"
import { computePortfolioForYear } from "./portfolio"
import { computeEducationForYear, computeMarriageForYear, computeWhitegoodsForYear, computeTravelForYear, computeHealthcareForYear, computeLivingExpenseForYear } from "../expenses"
import { computeCashflowMatchingSip, getEquityAllocation } from "../math"

/**
 * Build a goal bucket for a SINGLE lump-sum event at a future date.
 * Discounts the future cost back to today at the expected return rate.
 */
function buildBucket(
  category: GoalCategory,
  label: string,
  sublabel: string,
  presentCost: number,
  futureCost: number,
  yearsToGoal: number,
  expectedReturnPercent: number
): GoalBucket {
  const r = expectedReturnPercent / 100
  const cfs = [{ yearFromNow: yearsToGoal, amount: futureCost }]
  let lumpsum: number
  let sip: number
  if (yearsToGoal <= 0 || r <= 0) {
    lumpsum = futureCost
    sip = 0
  } else {
    lumpsum = futureCost / Math.pow(1 + r, yearsToGoal)
    sip = computeCashflowMatchingSip(cfs, r, yearsToGoal)
  }
  return {
    category, label, sublabel, presentCost, futureCost,
    yearsToGoal, expectedReturnPercent,
    lumpsumToday: lumpsum,
    monthlySip: sip,
    cashflows: cfs,
  }
}

/**
 * Build a goal bucket for a STREAM of annual payments spread across multiple
 * future years. Each year's inflated cost is discounted back individually.
 *
 * cashflows: array of { yearFromNow, amount } for each future payment.
 * Lumpsum = sum of PV of each cashflow.
 * SIP = monthly SIP that accumulates to produce each cashflow on time,
 *        approximated as SIP needed to fund the total lumpsum (PV) at t=0
 *        compounded forward over the weighted-average time horizon.
 */
function buildStreamBucket(
  category: GoalCategory,
  label: string,
  sublabel: string,
  presentCost: number,
  cashflows: { yearFromNow: number; amount: number }[],
  expectedReturnPercent: number
): GoalBucket {
  const r = expectedReturnPercent / 100
  let futureCost = 0
  let lumpsum = 0

  for (const cf of cashflows) {
    futureCost += cf.amount
    if (cf.yearFromNow <= 0 || r <= 0) {
      lumpsum += cf.amount
    } else {
      lumpsum += cf.amount / Math.pow(1 + r, cf.yearFromNow)
    }
  }

  // SIP years = last cashflow year + 1 (contribute until last payment)
  const sipYears = cashflows.length > 0 ? Math.max(1, cashflows[cashflows.length - 1].yearFromNow + 1) : 0
  const sip = r > 0 && sipYears > 0
    ? computeCashflowMatchingSip(cashflows, r, sipYears)
    : 0

  return {
    category, label, sublabel, presentCost, futureCost,
    yearsToGoal: sipYears,
    expectedReturnPercent,
    lumpsumToday: lumpsum,
    monthlySip: sip,
    cashflows,
  }
}

function summarizeCategory(
  category: GoalCategory,
  label: string,
  buckets: GoalBucket[]
): GoalCategorySummary {
  return {
    category,
    label,
    buckets,
    totalPresentCost: buckets.reduce((s, b) => s + b.presentCost, 0),
    totalFutureCost: buckets.reduce((s, b) => s + b.futureCost, 0),
    totalLumpsumToday: buckets.reduce((s, b) => s + b.lumpsumToday, 0),
    totalMonthlySip: buckets.reduce((s, b) => s + b.monthlySip, 0),
  }
}

export function calculateFire(inputs: FireInputs): FireResults {
  const timeline = generateTimeline(inputs.baseProfile, inputs.children)

  // ── Phase 1: Compute expenses + main portfolio ──
  interface PartialYearData {
    timeline: typeof timeline[number]
    education: ReturnType<typeof computeEducationForYear>
    marriage: ReturnType<typeof computeMarriageForYear>
    whitegoods: ReturnType<typeof computeWhitegoodsForYear>
    travel: number
    healthcare: ReturnType<typeof computeHealthcareForYear>
    expense: YearlyExpenseResult
    portfolio: ReturnType<typeof computePortfolioForYear>
  }

  const partialYears: PartialYearData[] = []
  let portfolioBalance = inputs.investmentProfile.currentPortfolioValue
  let portfolioAtRetirement = 0
  let portfolioDepleted = false

  const survivalResult: PortfolioSurvivalResult = {
    survived: true,
    depletionYear: null,
    depletionAge: null,
    finalBalance: 0,
  }

  for (const year of timeline) {
    const education = computeEducationForYear(
      year,
      inputs.children,
      inputs.educationParameters
    )
    const marriage = computeMarriageForYear(
      year,
      inputs.children,
      inputs.marriageParameters
    )
    const whitegoods = computeWhitegoodsForYear(year, inputs.whitegoods)
    const travel = computeTravelForYear(year, inputs.travelParameters)
    const healthcare = computeHealthcareForYear(year, inputs.healthcareParameters)
    const livingExpense = computeLivingExpenseForYear(year, inputs.expenseProfile)

    const totalExpense =
      livingExpense +
      education.totalEducationCost +
      marriage.totalMarriageCost +
      whitegoods.totalWhitegoodsCost +
      travel +
      healthcare.totalHealthcareCost

    const withdrawalAmount = year.isRetired ? totalExpense : 0

    const expense: YearlyExpenseResult = {
      livingExpense,
      educationCost: education.totalEducationCost,
      marriageCost: marriage.totalMarriageCost,
      whitegoodsCost: whitegoods.totalWhitegoodsCost,
      travelCost: travel,
      healthcareCost: healthcare.totalHealthcareCost,
      totalExpense,
      withdrawalAmount,
    }

    if (year.isRetired && year.yearsInRetirement === 0) {
      portfolioAtRetirement = portfolioBalance
    }

    const portfolio = portfolioDepleted
      ? {
          openingBalance: 0,
          contribution: 0,
          withdrawal: withdrawalAmount,
          equityPercent: 0,
          debtPercent: 0,
          blendedReturn: 0,
          returnAmount: 0,
          closingBalance: 0,
          isDepleted: true,
        }
      : computePortfolioForYear(
          year,
          portfolioBalance,
          withdrawalAmount,
          inputs.investmentProfile,
          inputs.fireAssumptions
        )

    if (portfolio.isDepleted && !portfolioDepleted) {
      portfolioDepleted = true
      survivalResult.survived = false
      survivalResult.depletionYear = year.calendarYear
      survivalResult.depletionAge = year.userAge
    }

    portfolioBalance = portfolio.closingBalance

    partialYears.push({
      timeline: year,
      education,
      marriage,
      whitegoods,
      travel,
      healthcare,
      expense,
      portfolio,
    })
  }

  survivalResult.finalBalance = portfolioBalance

  // ── Goal-based blended return from user inputs ──
  const gi = inputs.fireAssumptions.goalInvestment
  const goalReturnPct =
    (gi.equityPercent / 100) * gi.equityReturnPercent +
    (gi.debtPercent / 100) * gi.debtReturnPercent

  // ── Education Buckets: per child × per phase ──
  const eduBuckets: GoalBucket[] = []
  const eduParams = inputs.educationParameters
  for (let ci = 0; ci < inputs.children.length; ci++) {
    const child = inputs.children[ci]
    const childLabel = `Child ${ci + 1}`

    // School — multi-year annual fee stream
    const schoolYears = eduParams.school.durationYears
    const schoolStartYearIdx = Math.max(0, child.schoolStartAge - child.currentAge)
    const schoolCashflows: { yearFromNow: number; amount: number }[] = []
    for (let y = 0; y < schoolYears; y++) {
      const yearFromNow = schoolStartYearIdx + y
      if (yearFromNow < 0) continue // past payments, skip
      schoolCashflows.push({
        yearFromNow,
        amount: eduParams.school.currentAnnualFee *
          Math.pow(1 + eduParams.school.inflationPercent / 100, yearFromNow),
      })
    }
    const schoolPresentTotal = eduParams.school.currentAnnualFee * schoolYears
    if (schoolPresentTotal > 0) {
      const remainingYears = schoolCashflows.length
      eduBuckets.push(
        buildStreamBucket(
          "education",
          `${childLabel} — Schooling`,
          `${remainingYears} yrs remaining, first payment in ${schoolCashflows[0]?.yearFromNow ?? 0} yrs`,
          schoolPresentTotal,
          schoolCashflows,
          goalReturnPct
        )
      )
    }

    // Graduation — multi-year cost stream
    const gradYears = eduParams.graduation.durationYears
    const gradStartYearIdx = Math.max(0, child.graduationStartAge - child.currentAge)
    const gradAnnual = eduParams.graduation.currentTotalCost / gradYears
    const gradCashflows: { yearFromNow: number; amount: number }[] = []
    for (let y = 0; y < gradYears; y++) {
      const yearFromNow = gradStartYearIdx + y
      if (yearFromNow < 0) continue
      gradCashflows.push({
        yearFromNow,
        amount: gradAnnual *
          Math.pow(1 + eduParams.graduation.inflationPercent / 100, yearFromNow),
      })
    }
    if (eduParams.graduation.currentTotalCost > 0) {
      eduBuckets.push(
        buildStreamBucket(
          "education",
          `${childLabel} — Graduation`,
          `${gradCashflows.length} yrs, starts in ${gradStartYearIdx} yrs`,
          eduParams.graduation.currentTotalCost,
          gradCashflows,
          goalReturnPct
        )
      )
    }

    // Post Graduation — multi-year cost stream
    const pgYears = eduParams.postGraduation.durationYears
    const pgStartYearIdx = Math.max(0, child.postGraduationStartAge - child.currentAge)
    const pgAnnual = eduParams.postGraduation.currentTotalCost / pgYears
    const pgCashflows: { yearFromNow: number; amount: number }[] = []
    for (let y = 0; y < pgYears; y++) {
      const yearFromNow = pgStartYearIdx + y
      if (yearFromNow < 0) continue
      pgCashflows.push({
        yearFromNow,
        amount: pgAnnual *
          Math.pow(1 + eduParams.postGraduation.inflationPercent / 100, yearFromNow),
      })
    }
    if (eduParams.postGraduation.currentTotalCost > 0) {
      eduBuckets.push(
        buildStreamBucket(
          "education",
          `${childLabel} — Post Graduation`,
          `${pgCashflows.length} yrs, starts in ${pgStartYearIdx} yrs`,
          eduParams.postGraduation.currentTotalCost,
          pgCashflows,
          goalReturnPct
        )
      )
    }
  }

  // ── Marriage Buckets: per child ──
  const marriageBuckets: GoalBucket[] = []
  for (let ci = 0; ci < inputs.children.length; ci++) {
    const child = inputs.children[ci]
    const yearsToMarriage = Math.max(0, child.marriageAge - child.currentAge)
    const futureCost =
      inputs.marriageParameters.currentCostPerChild *
      Math.pow(1 + inputs.marriageParameters.inflationPercent / 100, yearsToMarriage)
    marriageBuckets.push(
      buildBucket(
        "marriage",
        `Child ${ci + 1} — Marriage`,
        `In ${yearsToMarriage} years (age ${child.marriageAge})`,
        inputs.marriageParameters.currentCostPerChild,
        futureCost,
        yearsToMarriage,
        goalReturnPct
      )
    )
  }

  // ── Whitegoods Buckets: per item, all future replacements over lifetime ──
  const wgBuckets: GoalBucket[] = []
  const totalProjectionYears = inputs.baseProfile.lifeExpectancyAge - inputs.baseProfile.currentAge
  for (const item of inputs.whitegoods) {
    const freq = item.replacementFrequencyYears
    const wgCashflows: { yearFromNow: number; amount: number }[] = []
    for (let yr = freq; yr <= totalProjectionYears; yr += freq) {
      wgCashflows.push({
        yearFromNow: yr,
        amount: item.currentCost * Math.pow(1 + item.inflationPercent / 100, yr),
      })
    }
    const replacementCount = wgCashflows.length
    if (replacementCount > 0) {
      wgBuckets.push(
        buildStreamBucket(
          "whitegoods",
          item.itemName,
          `${replacementCount} replacements, every ${freq} yrs`,
          item.currentCost * replacementCount,
          wgCashflows,
          goalReturnPct
        )
      )
    }
  }

  // ── Healthcare Bucket: annual stream over lifetime ──
  const hcAnnualPresent =
    inputs.healthcareParameters.currentAnnualMedicalExpense +
    inputs.healthcareParameters.currentInsurancePremium
  const hcYears = inputs.baseProfile.lifeExpectancyAge - inputs.baseProfile.currentAge
  const hcCashflows: { yearFromNow: number; amount: number }[] = []
  for (let yr = 0; yr < hcYears; yr++) {
    const medical =
      inputs.healthcareParameters.currentAnnualMedicalExpense *
      Math.pow(1 + inputs.healthcareParameters.medicalInflationPercent / 100, yr)
    const insurance =
      inputs.healthcareParameters.currentInsurancePremium *
      Math.pow(1 + inputs.healthcareParameters.insurancePremiumInflationPercent / 100, yr)
    hcCashflows.push({ yearFromNow: yr, amount: medical + insurance })
  }
  const hcBuckets: GoalBucket[] = [
    buildStreamBucket(
      "healthcare",
      "Healthcare (Lifetime)",
      `Medical + Insurance, ${hcYears} yrs till age ${inputs.baseProfile.lifeExpectancyAge}`,
      hcAnnualPresent * hcYears,
      hcCashflows,
      goalReturnPct
    ),
  ]

  // ── Travel Bucket: annual stream till stop age ──
  const travelYears = Math.max(0, inputs.travelParameters.stopAge - inputs.baseProfile.currentAge)
  const travelCashflows: { yearFromNow: number; amount: number }[] = []
  for (let yr = 0; yr < travelYears; yr++) {
    travelCashflows.push({
      yearFromNow: yr,
      amount: inputs.travelParameters.currentAnnualCost *
        Math.pow(1 + inputs.travelParameters.inflationPercent / 100, yr),
    })
  }
  const travelBuckets: GoalBucket[] = [
    buildStreamBucket(
      "travel",
      "Travel & Hobbies",
      `Annual for ${travelYears} yrs till age ${inputs.travelParameters.stopAge}`,
      inputs.travelParameters.currentAnnualCost * travelYears,
      travelCashflows,
      goalReturnPct
    ),
  ]

  // ── Living Expense Bucket: retirement corpus ──
  // Binary search for min corpus at retirement to cover ONLY living expenses
  const fireEquity = inputs.fireAssumptions.expectedEquityReturnPercent
  const fireDebt = inputs.fireAssumptions.expectedDebtReturnPercent
  const checkpoints = inputs.fireAssumptions.glidepathCheckpoints
  const yearsToRetirement = inputs.baseProfile.retirementAge - inputs.baseProfile.currentAge

  const postRetirementYears = partialYears.filter((y) => y.timeline.isRetired)
  let retirementLivingCorpus = 0

  if (postRetirementYears.length > 0) {
    let lo = 0
    let hi = postRetirementYears.reduce((s, y) => s + y.expense.livingExpense, 0) * 2
    const TOLERANCE = 10000

    for (let iter = 0; iter < 100 && (hi - lo) > TOLERANCE; iter++) {
      const mid = (lo + hi) / 2
      let balance = mid
      let survived = true
      for (const yr of postRetirementYears) {
        const eqPct = getEquityAllocation(yr.timeline.userAge, checkpoints) / 100
        const blendedReturn = (eqPct * fireEquity + (1 - eqPct) * fireDebt) / 100
        balance = (balance - yr.expense.livingExpense) * (1 + blendedReturn)
        if (balance < 0) { survived = false; break }
      }
      if (survived) hi = mid; else lo = mid
    }
    retirementLivingCorpus = Math.ceil(hi)
  }

  // Compute average blended return from now to retirement using glidepath (for SIP/lumpsum)
  let blendedReturnSum = 0
  for (let yr = 0; yr < yearsToRetirement; yr++) {
    const age = inputs.baseProfile.currentAge + yr
    const eqPct = getEquityAllocation(age, checkpoints) / 100
    const blended = eqPct * fireEquity + (1 - eqPct) * fireDebt
    blendedReturnSum += blended
  }
  const livingReturnPct = yearsToRetirement > 0
    ? blendedReturnSum / yearsToRetirement
    : fireEquity

  const livingPresentAnnual = inputs.expenseProfile.currentAnnualHouseholdExpense
  const livingBuckets: GoalBucket[] = [
    buildBucket(
      "living",
      "Retirement Living Corpus",
      `Simulated with glidepath returns & living expenses only`,
      livingPresentAnnual *
        (inputs.baseProfile.lifeExpectancyAge - inputs.baseProfile.retirementAge),
      retirementLivingCorpus,
      yearsToRetirement,
      livingReturnPct
    ),
  ]

  // ── Build category summaries ──
  const goalCategories: GoalCategorySummary[] = [
    summarizeCategory("education", "Education", eduBuckets),
    summarizeCategory("marriage", "Marriage", marriageBuckets),
    summarizeCategory("healthcare", "Healthcare", hcBuckets),
    summarizeCategory("whitegoods", "Whitegoods", wgBuckets),
    summarizeCategory("travel", "Travel", travelBuckets),
    summarizeCategory("living", "Retirement Living", livingBuckets),
  ]

  // Total Goal Corpus & Lumpsum = sum of all non-living goal categories
  const goalOnlyCategories = goalCategories.filter((c) => c.category !== "living")
  const totalGoalCorpus = goalOnlyCategories.reduce((s, c) => s + c.totalFutureCost, 0)
  const totalGoalLumpsumToday = goalOnlyCategories.reduce((s, c) => s + c.totalLumpsumToday, 0)

  // Longest goal horizon across all buckets (for "SIP for X years")
  const longestGoalHorizonYears = goalOnlyCategories.reduce((max, c) => {
    const catMax = c.buckets.reduce((m, b) => Math.max(m, b.yearsToGoal), 0)
    return Math.max(max, catMax)
  }, 0)

  const totalRequiredCorpus = retirementLivingCorpus + totalGoalCorpus
  const corpusGap = totalRequiredCorpus - portfolioAtRetirement
  const livingCorpusGap = retirementLivingCorpus - portfolioAtRetirement
  const goalCorpusGap = Math.max(0, corpusGap - Math.max(0, livingCorpusGap))
  const totalMonthlySipRequired = goalCategories.reduce((s, c) => s + c.totalMonthlySip, 0)

  // ── Phase 2: Per-BUCKET portfolio simulations ──
  // Each bucket (e.g. "Child 1 — Schooling") gets its own independent portfolio:
  //   starts from ₹0, receives SIP contributions, withdraws its own cashflows, closes to ~₹0
  function simYear(
    balance: number,
    contribution: number,
    withdrawal: number,
    returnRate: number
  ): SimulatedPortfolioYear {
    const afterContrib = balance + contribution
    const afterWithdrawal = Math.max(0, afterContrib - withdrawal)
    const returnAmt = afterWithdrawal * returnRate
    let closing = afterWithdrawal + returnAmt
    let actualWithdrawal = withdrawal

    // If residual balance < ₹500, treat as full withdrawal (close the account)
    if (closing > 0 && closing < 500) {
      actualWithdrawal = withdrawal + closing
      closing = 0
    }

    return {
      openingBalance: balance,
      contribution,
      withdrawal: actualWithdrawal,
      returnPercent: returnRate * 100,
      returnAmount: closing === 0 && afterWithdrawal < 500 ? 0 : returnAmt,
      closingBalance: closing,
      isDepleted: afterContrib < withdrawal && withdrawal > 0,
    }
  }

  const zeroPortfolio: SimulatedPortfolioYear = {
    openingBalance: 0, contribution: 0, withdrawal: 0, returnPercent: 0,
    returnAmount: 0, closingBalance: 0, isDepleted: false,
  }

  const goalReturnRate = goalReturnPct / 100

  // Collect ALL buckets (from all goal categories) + living pseudo-bucket
  const allBuckets: GoalBucket[] = goalCategories.flatMap((c) => c.buckets)

  // Build per-bucket cashflow map: bucketLabel → yearIndex → withdrawal amount
  const bucketCashflowMap: Record<string, Record<number, number>> = {}
  // Track the last year of any activity (SIP or withdrawal) per bucket
  const bucketLastActiveYear: Record<string, number> = {}
  for (const bucket of allBuckets) {
    const map: Record<number, number> = {}
    let lastYear = bucket.yearsToGoal - 1 // last SIP year
    for (const cf of bucket.cashflows) {
      map[cf.yearFromNow] = (map[cf.yearFromNow] ?? 0) + cf.amount
      lastYear = Math.max(lastYear, cf.yearFromNow)
    }
    bucketCashflowMap[bucket.label] = map
    bucketLastActiveYear[bucket.label] = lastYear
  }

  // Running balances per bucket — all start from ₹0
  const bucketBalances: Record<string, number> = {}
  for (const bucket of allBuckets) {
    bucketBalances[bucket.label] = 0
  }
  let livingBalance = 0

  const yearByYear: YearResult[] = []

  for (const py of partialYears) {
    const yearIdx = py.timeline.yearIndex
    const bucketPortfolios: Record<string, SimulatedPortfolioYear> = {}

    // Goal buckets: each has its own SIP and cashflow-based withdrawals
    for (const bucket of allBuckets) {
      const bal = bucketBalances[bucket.label]
      const lastActive = bucketLastActiveYear[bucket.label]

      // If past the last active year and balance remains, force-close the account
      if (yearIdx > lastActive && bal > 0) {
        bucketPortfolios[bucket.label] = {
          openingBalance: bal, contribution: 0, withdrawal: bal,
          returnPercent: goalReturnRate * 100, returnAmount: 0,
          closingBalance: 0, isDepleted: false,
        }
        bucketBalances[bucket.label] = 0
        continue
      }

      const contrib = yearIdx < bucket.yearsToGoal ? bucket.monthlySip * 12 : 0
      const withdrawal = bucketCashflowMap[bucket.label]?.[yearIdx] ?? 0
      const sim = simYear(bal, contrib, withdrawal, goalReturnRate)
      bucketBalances[bucket.label] = sim.closingBalance
      bucketPortfolios[bucket.label] = sim
    }

    // Living portfolio: starts at retirement with retirementLivingCorpus, glidepath returns
    if (py.timeline.isRetired && py.timeline.yearsInRetirement === 0) {
      livingBalance = retirementLivingCorpus
    }
    if (py.timeline.isRetired) {
      const eqPct = getEquityAllocation(py.timeline.userAge, checkpoints) / 100
      const livingReturnRate = (eqPct * fireEquity + (1 - eqPct) * fireDebt) / 100
      const livingSim = simYear(livingBalance, 0, py.expense.livingExpense, livingReturnRate)
      livingBalance = livingSim.closingBalance
      bucketPortfolios["Living Expenses"] = livingSim
    } else {
      bucketPortfolios["Living Expenses"] = zeroPortfolio
    }

    yearByYear.push({
      ...py,
      bucketPortfolios,
    })
  }

  const summary: SummaryResult = {
    goalCategories,
    retirementLivingCorpus,
    totalGoalCorpus,
    totalGoalLumpsumToday,
    totalRequiredCorpus,
    portfolioAtRetirement,
    corpusGap,
    goalCorpusGap,
    livingCorpusGap: Math.max(0, livingCorpusGap),
    totalMonthlySipRequired,
    totalAnnualSipRequired: totalMonthlySipRequired * 12,
    longestGoalHorizonYears,
    portfolioSurvival: survivalResult,
  }

  return { summary, yearByYear }
}
