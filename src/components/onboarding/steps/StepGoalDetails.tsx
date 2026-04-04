import { useState, useMemo } from "react"
import { Plus, Trash2, AlertTriangle, Info, ChevronRight, TrendingUp } from "lucide-react"
import type {
  StepProps,
  GoalType,
  FireGoalDetails,
  SchoolFeesChild,
  GraduationGoalEntry,
  MarriageGoalEntry,
  HouseDownPaymentGoalDetails,
  WhitegoodsItem,
  CustomGoalDetailEntry,
  GoalDetails,
  OnboardingData,
} from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"
import { computeFireCorpus, computeFireCorpusFinite, computeLumpsumNeeded, computeSipNeeded, computeSchoolFeeCorpus, computeGraduationCorpus, computeMarriageCorpus } from "@/engine"


function formatINR(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

const GOAL_TAB_CONFIG: Record<string, { emoji: string; label: string }> = {
  fire: { emoji: "🔥", label: "FIRE" },
  "school-fees": { emoji: "🏫", label: "School Fees" },
  graduation: { emoji: "🎓", label: "Graduation" },
  marriage: { emoji: "💍", label: "Marriage" },
  "house-down-payment": { emoji: "🏡", label: "House" },
  whitegoods: { emoji: "📦", label: "Whitegoods" },
  custom: { emoji: "✦", label: "Custom" },
}

export function StepGoalDetails({ data, updateData }: StepProps) {
  const activeGoals = data.selectedGoals.filter((g, i, arr) => arr.indexOf(g) === i)
  const [activeTab, setActiveTab] = useState<string>(activeGoals[0] ?? "fire")

  // If activeTab is no longer in the list, reset to first goal
  const resolvedTab = activeGoals.includes(activeTab as GoalType) ? activeTab : activeGoals[0] ?? "fire"

  function updateGoalDetails(updates: Partial<GoalDetails>) {
    updateData({ goalDetails: { ...data.goalDetails, ...updates } })
  }

  if (activeGoals.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Info className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="font-medium">No goals selected.</p>
        <p className="text-sm">Go back and select at least one goal to configure.</p>
      </div>
    )
  }

  const currentIdx = activeGoals.indexOf(resolvedTab as GoalType)
  const tabConfig = GOAL_TAB_CONFIG[resolvedTab]

  return (
    <div className="space-y-4">
      {/* Prominent goal navigation — pill bar with count badge */}
      <div className="flex flex-wrap gap-2">
        {activeGoals.map((goal, idx) => {
          const cfg = GOAL_TAB_CONFIG[goal] ?? { emoji: "✦", label: goal }
          const isActive = resolvedTab === goal
          return (
            <button
              key={goal}
              type="button"
              onClick={() => setActiveTab(goal)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <span className={`ml-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                isActive ? "bg-emerald-200 text-emerald-900" : "bg-slate-100 text-slate-400"
              }`}>
                {idx + 1}/{activeGoals.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Current goal header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-lg">{tabConfig?.emoji}</span>
        <h4 className="text-base font-bold text-slate-800">{tabConfig?.label} Details</h4>
        {activeGoals.length > 1 && (
          <span className="ml-auto text-xs text-slate-500">
            Goal {currentIdx + 1} of {activeGoals.length}
            {currentIdx < activeGoals.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeGoals[currentIdx + 1])}
                className="ml-2 inline-flex items-center gap-0.5 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Next goal <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </span>
        )}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {resolvedTab === "fire" && <FireTab data={data} updateGoalDetails={updateGoalDetails} updateData={updateData} />}
        {resolvedTab === "school-fees" && <SchoolFeesTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "graduation" && <GraduationTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "marriage" && <MarriageTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "house-down-payment" && <HouseTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "whitegoods" && <WhitegoodsTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "custom" && <CustomTab data={data} updateGoalDetails={updateGoalDetails} />}
      </div>
    </div>
  )
}

// ── Shared props for tab sub-components ───────────────────
interface TabProps {
  data: StepProps["data"]
  updateGoalDetails: (updates: Partial<GoalDetails>) => void
  updateData?: (updates: Partial<OnboardingData>) => void
}

// ── FIRE Tab ──────────────────────────────────────────────
function FireTab({ data, updateGoalDetails, updateData }: TabProps) {
  const fire: FireGoalDetails = data.goalDetails.fire ?? {
    targetAge: data.profile.retirementAge,
    safeWithdrawalRate: 2.5,
    inflationAssumed: 6,
    postRetirementReturn: 10,
    fireModel: "finite",
    expectedReturns: 12,
  }

  function update(patch: Partial<FireGoalDetails>) {
    const updated = { ...fire, ...patch }
    updateGoalDetails({ fire: updated })
    if (patch.targetAge !== undefined && updateData) {
      updateData({ profile: { ...data.profile, retirementAge: patch.targetAge } })
    }
  }

  const model = fire.fireModel ?? "finite"
  const swr = fire.safeWithdrawalRate
  const postRetReturn = fire.postRetirementReturn ?? 10
  const preRetReturn = fire.expectedReturns ?? 12
  const yearsToFire = fire.targetAge - data.profile.currentAge
  const yearsInRetirement = data.profile.lifeExpectancy - fire.targetAge

  const expenseArgs = useMemo(() => ({
    currentAnnualHouseholdExpense: data.expenses.annualHouseholdExpense * 12,
    expenseInflationPercent: fire.inflationAssumed,
    expenseAdjustmentFactorAtRetirement: data.expenses.retirementAdjustmentFactor,
  }), [data.expenses.annualHouseholdExpense, fire.inflationAssumed, data.expenses.retirementAdjustmentFactor])

  const baseArgs = useMemo(() => ({
    currentAge: data.profile.currentAge,
    retirementAge: fire.targetAge,
    lifeExpectancyAge: data.profile.lifeExpectancy,
  }), [data.profile.currentAge, fire.targetAge, data.profile.lifeExpectancy])

  // Always compute both
  const swrResult = useMemo(
    () => computeFireCorpus(baseArgs, expenseArgs, swr / 100),
    [baseArgs, expenseArgs, swr],
  )
  const finiteResult = useMemo(
    () => computeFireCorpusFinite(baseArgs, expenseArgs, postRetReturn / 100),
    [baseArgs, expenseArgs, postRetReturn],
  )

  // Derived values for selected model
  const selectedCorpus = model === "finite" ? finiteResult.corpusRequired : swrResult.corpusRequired
  const selectedLumpsum = useMemo(
    () => computeLumpsumNeeded(selectedCorpus, preRetReturn / 100, yearsToFire),
    [selectedCorpus, yearsToFire, preRetReturn],
  )
  const selectedSip = useMemo(
    () => computeSipNeeded(selectedCorpus, preRetReturn / 100, yearsToFire),
    [selectedCorpus, yearsToFire, preRetReturn],
  )

  // Safe target = midpoint of both models
  const safeCorpus = (finiteResult.corpusRequired + swrResult.corpusRequired) / 2
  const safeLumpsum = useMemo(
    () => computeLumpsumNeeded(safeCorpus, preRetReturn / 100, yearsToFire),
    [safeCorpus, yearsToFire, preRetReturn],
  )
  const safeSip = useMemo(
    () => computeSipNeeded(safeCorpus, preRetReturn / 100, yearsToFire),
    [safeCorpus, yearsToFire, preRetReturn],
  )

  const swrWarning =
    swr > 3.5
      ? "Above standard — higher risk of outliving your corpus."
      : swr < 2.5
        ? "Very conservative — you may be saving more than necessary."
        : null

  return (
    <div className="space-y-5">
      <NumberField
        label="Target FIRE Age"
        value={fire.targetAge}
        onChange={(v) => update({ targetAge: v })}
        min={30}
        max={100}
      />

      <NumberField
        label="Inflation Assumed"
        value={fire.inflationAssumed}
        onChange={(v) => update({ inflationAssumed: v })}
        suffix="%"
        step={0.5}
      />

      {/* Model toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Calculation Model</label>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => update({ fireModel: "finite" })}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              model === "finite"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Finite ({yearsInRetirement}yr)
          </button>
          <button
            type="button"
            onClick={() => update({ fireModel: "perpetual" })}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              model === "perpetual"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Perpetual (SWR)
          </button>
        </div>
      </div>

      {/* Conditional slider based on model */}
      {model === "perpetual" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Safe Withdrawal Rate</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0} max={10} step={0.25} value={swr}
              onChange={(e) => update({ safeWithdrawalRate: Number(e.target.value) })}
              className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-emerald-600"
            />
            <span className="text-sm font-bold text-emerald-700 min-w-[48px] text-right">{swr}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
            <span>0%</span>
            <span className="text-amber-500 font-medium">2.5% (conservative)</span>
            <span className="text-emerald-600 font-medium">3.5% (standard)</span>
            <span>10%</span>
          </div>
          {swrWarning && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{swrWarning}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Post-Retirement Returns</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={4} max={14} step={0.5} value={postRetReturn}
              onChange={(e) => update({ postRetirementReturn: Number(e.target.value) })}
              className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-emerald-600"
            />
            <span className="text-sm font-bold text-emerald-700 min-w-[48px] text-right">{postRetReturn}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
            <span>4%</span>
            <span className="text-amber-500 font-medium">8% (conservative)</span>
            <span className="text-emerald-600 font-medium">10% (balanced)</span>
            <span>14%</span>
          </div>
        </div>
      )}

      {/* Pre-retirement expected returns slider */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Expected Pre-Retirement Returns</label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={6} max={18} step={0.5} value={preRetReturn}
            onChange={(e) => update({ expectedReturns: Number(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-emerald-600"
          />
          <span className="text-sm font-bold text-emerald-700 min-w-[48px] text-right">{preRetReturn}%</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
          <span>6%</span>
          <span className="text-emerald-600 font-medium">12% (equity)</span>
          <span>18%</span>
        </div>
      </div>

      {/* Calculation cards */}
      {yearsToFire > 0 && selectedCorpus > 0 && (
        <div className="space-y-4">
          {/* Selected model card */}
          <div className="space-y-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h5 className="text-sm font-bold text-emerald-900">
                {model === "finite" ? "Finite Estimate" : "SWR Estimate"}
              </h5>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-medium">
                {model === "finite"
                  ? `${yearsInRetirement}yr · ${postRetReturn}% returns`
                  : `Perpetual · ${swr}% SWR`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2.5 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Corpus</p>
                <p className="text-sm font-bold text-emerald-800 mt-1">{formatINR(selectedCorpus)}</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                <p className="text-sm font-bold text-emerald-800 mt-1">{formatINR(selectedLumpsum)}</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                <p className="text-sm font-bold text-emerald-800 mt-1">{formatINR(selectedSip)}</p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-700/70 leading-relaxed">
              {model === "finite"
                ? `Corpus lasts ${yearsInRetirement} years (age ${fire.targetAge}–${data.profile.lifeExpectancy}) at ${fire.inflationAssumed}% inflation and ${postRetReturn}% post-retirement returns.`
                : `Corpus never depletes at ${swr}% annual withdrawal and ${fire.inflationAssumed}% inflation.`}
              {" "}Lumpsum & SIP assume {preRetReturn}% pre-retirement returns over {yearsToFire} years.
            </p>
          </div>

          {/* Safe target card — midpoint */}
          {safeCorpus > 0 && (
            <div className="space-y-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h5 className="text-sm font-bold text-amber-900">Recommended Safe Target</h5>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Corpus</p>
                  <p className="text-sm font-bold text-amber-800 mt-1">{formatINR(safeCorpus)}</p>
                </div>
                <div className="text-center p-2.5 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold text-amber-800 mt-1">{formatINR(safeLumpsum)}</p>
                </div>
                <div className="text-center p-2.5 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold text-amber-800 mt-1">{formatINR(safeSip)}</p>
                </div>
              </div>
              <p className="text-[10px] text-amber-700/80 leading-relaxed">
                Average of both models. Accounts for real-world uncertainty — market volatility,
                sequence-of-returns risk, unexpected expenses, and potential policy or tax changes.
                A middle ground between optimistic and conservative planning.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── School Fees Tab ───────────────────────────────────────
function SchoolFeesTab({ data, updateGoalDetails }: TabProps) {
  const childCount = Math.max(data.profile.numberOfChildren, 1)
  const existing = data.goalDetails.schoolFees ?? []

  const children: SchoolFeesChild[] = Array.from({ length: childCount }, (_, i) =>
    existing[i] ?? {
      label: `Child ${i + 1}`,
      childCurrentAge: 0,
      schoolStartingAge: 4,
      currentSchoolFeeYearly: 0,
      expectedInflationYearly: 11,
      feeHikeEveryNYears: 2,
      totalSchoolYears: 12,
      expectedReturns: 12,
    }
  )

  function updateChild(index: number, patch: Partial<SchoolFeesChild>) {
    const updated = [...children]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ schoolFees: updated })
  }

  return (
    <div className="space-y-6">
      {children.map((child, idx) => (
        <SchoolFeeChildCard key={idx} child={child} index={idx} updateChild={updateChild} />
      ))}
    </div>
  )
}

function SchoolFeeChildCard({
  child,
  index,
  updateChild,
}: {
  child: SchoolFeesChild
  index: number
  updateChild: (index: number, patch: Partial<SchoolFeesChild>) => void
}) {
  const yearsUntilSchoolStarts = Math.max(0, child.schoolStartingAge - child.childCurrentAge)
  const hikeEvery = child.feeHikeEveryNYears ?? 2
  const totalYears = child.totalSchoolYears ?? 12
  const expReturns = child.expectedReturns ?? 12

  const result = useMemo(
    () =>
      computeSchoolFeeCorpus({
        currentAnnualFee: child.currentSchoolFeeYearly,
        feeHikePercent: child.expectedInflationYearly,
        feeHikeEveryNYears: hikeEvery,
        yearsUntilSchoolStarts,
        totalSchoolYears: totalYears,
        nearReturn: Math.min(expReturns, 10) / 100,
        farReturn: expReturns / 100,
      }),
    [child.currentSchoolFeeYearly, child.expectedInflationYearly, hikeEvery, yearsUntilSchoolStarts, totalYears, expReturns],
  )

  const equityCount = result.feeSchedule.filter((e) => e.bucket === "equity").length
  const debtCount = result.feeSchedule.filter((e) => e.bucket === "debt").length
  const notInSchool = yearsUntilSchoolStarts > 0

  const sipNeeded = useMemo(
    () => notInSchool
      ? computeSipNeeded(result.totalLumpsumNeeded, result.effectiveReturn, yearsUntilSchoolStarts)
      : 0,
    [result.totalLumpsumNeeded, result.effectiveReturn, yearsUntilSchoolStarts, notInSchool],
  )

  const returnPct = Math.round(result.effectiveReturn * 100)

  return (
    <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Label / Name</label>
        <input
          type="text"
          value={child.label}
          onChange={(e) => updateChild(index, { label: e.target.value })}
          placeholder={`e.g., Child ${index + 1} School`}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Child Current Age"
          value={child.childCurrentAge}
          onChange={(v) => updateChild(index, { childCurrentAge: v })}
          min={0}
        />
        <NumberField
          label="School Starting Age"
          value={child.schoolStartingAge}
          onChange={(v) => updateChild(index, { schoolStartingAge: v })}
          min={3}
        />
        <NumberField
          label="Current Yearly Fee"
          value={child.currentSchoolFeeYearly}
          onChange={(v) => updateChild(index, { currentSchoolFeeYearly: v })}
          suffix="₹"
        />
        <NumberField
          label="Fee Hike %"
          value={child.expectedInflationYearly}
          onChange={(v) => updateChild(index, { expectedInflationYearly: v })}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Hike Every N Years"
          value={hikeEvery}
          onChange={(v) => updateChild(index, { feeHikeEveryNYears: v })}
          min={1}
        />
        <NumberField
          label="Total School Years"
          value={totalYears}
          onChange={(v) => updateChild(index, { totalSchoolYears: v })}
          min={1}
        />
      </div>

      {/* Expected returns slider */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Expected Returns</label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={6} max={18} step={0.5} value={expReturns}
            onChange={(e) => updateChild(index, { expectedReturns: Number(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-blue-600"
          />
          <span className="text-sm font-bold text-blue-700 min-w-[48px] text-right">{expReturns}%</span>
        </div>
      </div>

      {/* Per-child calculation card */}
      {result.totalLumpsumNeeded > 0 && (
        <div className="space-y-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h6 className="text-xs font-bold text-blue-900">
              {child.label || `Child ${index + 1}`} — {totalYears}yr schooling
            </h6>
          </div>
          <div className={`grid ${notInSchool ? "grid-cols-4" : "grid-cols-3"} gap-2`}>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Outflow</p>
              <p className="text-sm font-bold text-blue-800 mt-0.5">{formatINR(result.totalFeeOutflow)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
              <p className="text-sm font-bold text-blue-800 mt-0.5">{formatINR(result.totalLumpsumNeeded)}</p>
            </div>
            {notInSchool && (
              <div className="text-center p-2 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                <p className="text-sm font-bold text-blue-800 mt-0.5">{formatINR(sipNeeded)}</p>
              </div>
            )}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Equity / Debt</p>
              <p className="text-sm font-bold text-blue-800 mt-0.5">
                {formatINR(result.lumpsumEquity)} / {formatINR(result.lumpsumDebt)}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-blue-700/70 leading-relaxed">
            {result.useDualBucket
              ? `Dual-bucket: ${equityCount} yr equity, ${debtCount} yr debt at ${returnPct}% blended return (equity + debt combo). 3-year glide path.`
              : `Pure equity at ${returnPct}% CAGR — school starts in ${yearsUntilSchoolStarts} yr, enough time for full equity exposure.`}
            {notInSchool ? ` SIP over ${yearsUntilSchoolStarts} yr to accumulate corpus by school start.` : " Child already in school — corpus needed now."}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Graduation Tab ────────────────────────────────────────
function GraduationTab({ data, updateGoalDetails }: TabProps) {
  const childCount = Math.max(data.profile.numberOfChildren, 1)
  const existing = data.goalDetails.graduation ?? []

  const entries: GraduationGoalEntry[] = Array.from({ length: childCount }, (_, i) =>
    existing[i] ?? { label: `Child ${i + 1}`, graduationCostCurrent: 0, expectedInflationYearly: 5, horizonYears: 12, expectedReturns: 12 }
  )

  function updateEntry(index: number, patch: Partial<GraduationGoalEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ graduation: updated })
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, idx) => {
        const horizon = entry.horizonYears ?? 12
        const expRet = entry.expectedReturns ?? 12
        const result = computeGraduationCorpus(
          entry.graduationCostCurrent,
          entry.expectedInflationYearly / 100,
          horizon,
          expRet / 100,
        )

        return (
          <div key={idx} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Label / Name</label>
              <input
                type="text"
                value={entry.label}
                onChange={(e) => updateEntry(idx, { label: e.target.value })}
                placeholder={`e.g., Child ${idx + 1} Engineering`}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="Cost Today"
                value={entry.graduationCostCurrent}
                onChange={(v) => updateEntry(idx, { graduationCostCurrent: v })}
                suffix="₹"
              />
              <NumberField
                label="Inflation %"
                value={entry.expectedInflationYearly}
                onChange={(v) => updateEntry(idx, { expectedInflationYearly: v })}
                suffix="%"
                step={0.5}
              />
              <NumberField
                label="Years to Grad"
                value={horizon}
                onChange={(v) => updateEntry(idx, { horizonYears: v })}
                min={1}
              />
            </div>

            {/* Expected returns slider */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Expected Returns</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={6} max={18} step={0.5} value={expRet}
                  onChange={(e) => updateEntry(idx, { expectedReturns: Number(e.target.value) })}
                  className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-purple-600"
                />
                <span className="text-sm font-bold text-purple-700 min-w-[48px] text-right">{expRet}%</span>
              </div>
            </div>

            {result.targetCorpus > 0 && (
              <div className="space-y-2.5 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <h6 className="text-xs font-bold text-purple-900">
                    {entry.label || `Child ${idx + 1}`} — in {horizon} years
                  </h6>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Target Corpus</p>
                    <p className="text-sm font-bold text-purple-800 mt-0.5">{formatINR(result.targetCorpus)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                    <p className="text-sm font-bold text-purple-800 mt-0.5">{formatINR(result.lumpsumNeeded)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                    <p className="text-sm font-bold text-purple-800 mt-0.5">{formatINR(result.sipNeeded)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-purple-700/70 leading-relaxed">
                  {formatINR(entry.graduationCostCurrent)} today → {formatINR(result.targetCorpus)} in {horizon} years at {entry.expectedInflationYearly}% inflation.
                  Lumpsum & SIP at {expRet}% expected returns.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Marriage Tab ──────────────────────────────────────────
function MarriageTab({ data, updateGoalDetails }: TabProps) {
  const childCount = Math.max(data.profile.numberOfChildren, 1)
  const existing = data.goalDetails.marriage ?? []

  const entries: MarriageGoalEntry[] = existing.length > 0
    ? existing.map((e) => ({ ...e, bufferPercent: e.bufferPercent ?? 7.5, expectedReturns: e.expectedReturns ?? 12 }))
    : Array.from({ length: childCount }, (_, i) => ({
        label: `Child ${i + 1} Marriage`,
        marriageCostCurrent: 0,
        yearsRemaining: 10,
        expectedInflationYearly: 5,
        bufferPercent: 7.5,
        expectedReturns: 12,
      }))

  function updateEntry(index: number, patch: Partial<MarriageGoalEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ marriage: updated })
  }

  function addEntry() {
    updateGoalDetails({
      marriage: [
        ...entries,
        { label: "", marriageCostCurrent: 0, yearsRemaining: 10, expectedInflationYearly: 5, bufferPercent: 7.5, expectedReturns: 12 },
      ],
    })
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return
    updateGoalDetails({ marriage: entries.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => {
        const buffer = entry.bufferPercent ?? 7.5
        const expRet = entry.expectedReturns ?? 12
        const result = computeMarriageCorpus(
          entry.marriageCostCurrent,
          entry.expectedInflationYearly / 100,
          entry.yearsRemaining,
          expRet / 100,
          buffer / 100,
        )

        return (
          <div key={idx} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <label className="text-xs font-medium text-slate-600">Label / For Whom</label>
                <input
                  type="text"
                  value={entry.label}
                  onChange={(e) => updateEntry(idx, { label: e.target.value })}
                  placeholder="e.g., Daughter's Marriage, Own Marriage, Sister's Marriage"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-red-400 hover:text-red-600 mt-4">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Cost (Current)"
                value={entry.marriageCostCurrent}
                onChange={(v) => updateEntry(idx, { marriageCostCurrent: v })}
                suffix="₹"
              />
              <NumberField
                label="Years Remaining"
                value={entry.yearsRemaining}
                onChange={(v) => updateEntry(idx, { yearsRemaining: v })}
                min={1}
              />
              <NumberField
                label="Inflation %"
                value={entry.expectedInflationYearly}
                onChange={(v) => updateEntry(idx, { expectedInflationYearly: v })}
                suffix="%"
                step={0.5}
              />
              <NumberField
                label="Safety Buffer %"
                value={buffer}
                onChange={(v) => updateEntry(idx, { bufferPercent: v })}
                suffix="%"
                step={0.5}
              />
            </div>

            {/* Expected returns slider */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Expected Returns</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={6} max={18} step={0.5} value={expRet}
                  onChange={(e) => updateEntry(idx, { expectedReturns: Number(e.target.value) })}
                  className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-pink-600"
                />
                <span className="text-sm font-bold text-pink-700 min-w-[48px] text-right">{expRet}%</span>
              </div>
            </div>

            {result.targetCorpus > 0 && (
              <div className="space-y-2.5 p-3 rounded-lg bg-pink-50 border border-pink-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-pink-600" />
                  <h6 className="text-xs font-bold text-pink-900">
                    {entry.label || `Entry ${idx + 1}`} — in {entry.yearsRemaining} years
                  </h6>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Target (+ Buffer)</p>
                    <p className="text-sm font-bold text-pink-800 mt-0.5">{formatINR(result.targetCorpus)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                    <p className="text-sm font-bold text-pink-800 mt-0.5">{formatINR(result.lumpsumNeeded)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                    <p className="text-sm font-bold text-pink-800 mt-0.5">{formatINR(result.sipNeeded)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-pink-700/70 leading-relaxed">
                  Inflated: {formatINR(result.inflatedCorpus)} + {buffer}% buffer = {formatINR(result.targetCorpus)}.
                  At {entry.expectedInflationYearly}% inflation, {expRet}% expected returns over {entry.yearsRemaining} years.
                </p>
              </div>
            )}
          </div>
        )
      })}
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        <Plus className="h-4 w-4" /> Add Another Marriage Goal
      </button>
    </div>
  )
}

// ── House Down Payment Tab ────────────────────────────────
function HouseTab({ data, updateGoalDetails }: TabProps) {
  const house: HouseDownPaymentGoalDetails = data.goalDetails.houseDownPayment ?? {
    targetCost: 0,
    yearsRemaining: 5,
    inflationExpected: 7,
    expectedReturns: 12,
  }

  const inflation = house.inflationExpected ?? 7
  const expRet = house.expectedReturns ?? 12

  function update(patch: Partial<HouseDownPaymentGoalDetails>) {
    updateGoalDetails({ houseDownPayment: { ...house, ...patch } })
  }

  const inflatedTarget = Math.round(house.targetCost * Math.pow(1 + inflation / 100, house.yearsRemaining))
  const lumpsum = house.yearsRemaining > 0
    ? computeLumpsumNeeded(inflatedTarget, expRet / 100, house.yearsRemaining)
    : inflatedTarget
  const sip = house.yearsRemaining > 0
    ? computeSipNeeded(inflatedTarget, expRet / 100, house.yearsRemaining)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label="Target Cost (Today)"
          value={house.targetCost}
          onChange={(v) => update({ targetCost: v })}
          suffix="₹"
        />
        <NumberField
          label="Years Remaining"
          value={house.yearsRemaining}
          onChange={(v) => update({ yearsRemaining: v })}
          min={1}
        />
        <NumberField
          label="Inflation %"
          value={inflation}
          onChange={(v) => update({ inflationExpected: v })}
          suffix="%"
          step={0.5}
        />
      </div>

      {/* Expected returns slider */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Expected Returns</label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={6} max={18} step={0.5} value={expRet}
            onChange={(e) => update({ expectedReturns: Number(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-orange-600"
          />
          <span className="text-sm font-bold text-orange-700 min-w-[48px] text-right">{expRet}%</span>
        </div>
      </div>

      {inflatedTarget > 0 && (
        <div className="space-y-2.5 p-3 rounded-lg bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <h6 className="text-xs font-bold text-orange-900">House Down Payment — in {house.yearsRemaining} years</h6>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inflated Target</p>
              <p className="text-sm font-bold text-orange-800 mt-0.5">{formatINR(inflatedTarget)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
              <p className="text-sm font-bold text-orange-800 mt-0.5">{formatINR(lumpsum)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
              <p className="text-sm font-bold text-orange-800 mt-0.5">{formatINR(sip)}</p>
            </div>
          </div>
          <p className="text-[10px] text-orange-700/70 leading-relaxed">
            {formatINR(house.targetCost)} today → {formatINR(inflatedTarget)} in {house.yearsRemaining} years at {inflation}% inflation.
            Lumpsum & SIP at {expRet}% expected returns.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Whitegoods Tab ────────────────────────────────────────
function WhitegoodsTab({ data, updateGoalDetails }: TabProps) {
  const items: WhitegoodsItem[] = data.goalDetails.whitegoods ??
    [{ itemName: "", currentCost: 0, inflationExpected: 6, replacementFrequencyYears: 5, expectedReturns: 10 }]

  function updateItem(index: number, patch: Partial<WhitegoodsItem>) {
    const updated = [...items]
    updated[index] = { ...updated[index], ...patch }
    updateGoalDetails({ whitegoods: updated })
  }

  function addItem() {
    updateGoalDetails({
      whitegoods: [...items, { itemName: "", currentCost: 0, inflationExpected: 6, replacementFrequencyYears: 5, expectedReturns: 10 }],
    })
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    updateGoalDetails({ whitegoods: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const expRet = item.expectedReturns ?? 10
        const horizon = item.replacementFrequencyYears
        const inflatedCost = Math.round(item.currentCost * Math.pow(1 + item.inflationExpected / 100, horizon))
        const lumpsum = horizon > 0 ? computeLumpsumNeeded(inflatedCost, expRet / 100, horizon) : inflatedCost
        const sip = horizon > 0 ? computeSipNeeded(inflatedCost, expRet / 100, horizon) : 0

        return (
          <div key={idx} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <label className="text-xs font-medium text-slate-600">Item Name</label>
                <input
                  type="text"
                  value={item.itemName}
                  onChange={(e) => updateItem(idx, { itemName: e.target.value })}
                  placeholder="e.g., Refrigerator, Laptop"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 mt-4">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="Current Cost"
                value={item.currentCost}
                onChange={(v) => updateItem(idx, { currentCost: v })}
                suffix="₹"
              />
              <NumberField
                label="Inflation"
                value={item.inflationExpected}
                onChange={(v) => updateItem(idx, { inflationExpected: v })}
                suffix="%"
                step={0.5}
              />
              <NumberField
                label="Replace Every"
                value={item.replacementFrequencyYears}
                onChange={(v) => updateItem(idx, { replacementFrequencyYears: v })}
                suffix="years"
                min={1}
              />
            </div>
            {/* Expected returns slider */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Expected Returns</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={6} max={18} step={0.5} value={expRet}
                  onChange={(e) => updateItem(idx, { expectedReturns: Number(e.target.value) })}
                  className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-teal-600"
                />
                <span className="text-sm font-bold text-teal-700 min-w-[48px] text-right">{expRet}%</span>
              </div>
            </div>

            {inflatedCost > 0 && (
              <div className="space-y-2.5 p-3 rounded-lg bg-teal-50 border border-teal-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <h6 className="text-xs font-bold text-teal-900">
                    {item.itemName || `Item ${idx + 1}`} — every {horizon} years
                  </h6>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inflated Cost</p>
                    <p className="text-sm font-bold text-teal-800 mt-0.5">{formatINR(inflatedCost)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                    <p className="text-sm font-bold text-teal-800 mt-0.5">{formatINR(lumpsum)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                    <p className="text-sm font-bold text-teal-800 mt-0.5">{formatINR(sip)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-teal-700/70 leading-relaxed">
                  {formatINR(item.currentCost)} today → {formatINR(inflatedCost)} in {horizon} years at {item.inflationExpected}% inflation.
                  Lumpsum & SIP at {expRet}% expected returns.
                </p>
              </div>
            )}
          </div>
        )
      })}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        <Plus className="h-4 w-4" /> Add Item
      </button>
    </div>
  )
}

// ── Custom Goals Tab ──────────────────────────────────────
function CustomTab({ data, updateGoalDetails }: TabProps) {
  const customDefs = data.customGoalDefinitions
  const entries: CustomGoalDetailEntry[] = data.goalDetails.custom ?? []

  const merged: CustomGoalDetailEntry[] = customDefs.map((def) => {
    const existing = entries.find((e) => e.goalId === def.id)
    return existing ?? { goalId: def.id, targetCost: 0, yearsRemaining: 5, inflationExpected: 6, expectedReturns: 12 }
  })

  function updateEntry(goalId: string, patch: Partial<CustomGoalDetailEntry>) {
    const updated = merged.map((e) => (e.goalId === goalId ? { ...e, ...patch } : e))
    updateGoalDetails({ custom: updated })
  }

  if (customDefs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <p className="text-sm">No custom goals defined. Go back to goal selection to add one.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {customDefs.map((def) => {
        const entry = merged.find((e) => e.goalId === def.id)!
        const inflation = entry.inflationExpected ?? 6
        const expRet = entry.expectedReturns ?? 12
        const inflatedTarget = Math.round(entry.targetCost * Math.pow(1 + inflation / 100, entry.yearsRemaining))
        const lumpsum = entry.yearsRemaining > 0 ? computeLumpsumNeeded(inflatedTarget, expRet / 100, entry.yearsRemaining) : inflatedTarget
        const sip = entry.yearsRemaining > 0 ? computeSipNeeded(inflatedTarget, expRet / 100, entry.yearsRemaining) : 0

        return (
          <div key={def.id} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <h4 className="text-sm font-bold text-slate-800">{def.name}</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Target Cost (Today)"
                value={entry.targetCost}
                onChange={(v) => updateEntry(def.id, { targetCost: v })}
                suffix="₹"
              />
              <NumberField
                label="Years Remaining"
                value={entry.yearsRemaining}
                onChange={(v) => updateEntry(def.id, { yearsRemaining: v })}
                min={1}
              />
              <NumberField
                label="Inflation %"
                value={inflation}
                onChange={(v) => updateEntry(def.id, { inflationExpected: v })}
                suffix="%"
                step={0.5}
              />
            </div>

            {/* Expected returns slider */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Expected Returns</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={6} max={18} step={0.5} value={expRet}
                  onChange={(e) => updateEntry(def.id, { expectedReturns: Number(e.target.value) })}
                  className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-indigo-600"
                />
                <span className="text-sm font-bold text-indigo-700 min-w-[48px] text-right">{expRet}%</span>
              </div>
            </div>

            {inflatedTarget > 0 && (
              <div className="space-y-2.5 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <h6 className="text-xs font-bold text-indigo-900">
                    {def.name} — in {entry.yearsRemaining} years
                  </h6>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inflated Target</p>
                    <p className="text-sm font-bold text-indigo-800 mt-0.5">{formatINR(inflatedTarget)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                    <p className="text-sm font-bold text-indigo-800 mt-0.5">{formatINR(lumpsum)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                    <p className="text-sm font-bold text-indigo-800 mt-0.5">{formatINR(sip)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-indigo-700/70 leading-relaxed">
                  {formatINR(entry.targetCost)} today → {formatINR(inflatedTarget)} in {entry.yearsRemaining} years at {inflation}% inflation.
                  Lumpsum & SIP at {expRet}% expected returns.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
