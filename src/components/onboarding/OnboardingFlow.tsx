import { useState } from "react"
import { ArrowLeft, ArrowRight, LayoutDashboard } from "lucide-react"
import type { OnboardingStepMeta, OnboardingData } from "@/types/onboarding"
import { DEFAULT_ONBOARDING_DATA } from "@/types/onboarding"
import { prefetchSchemeList } from "@/hooks/useMfSchemes"
import { prefetchMetalPrices } from "@/services/metal-api"
import { StepProfile } from "./steps/StepProfile"
import { StepExpenses } from "./steps/StepExpenses"
import { StepGoalSelection } from "./steps/StepGoalSelection"
import { StepGoalDetails } from "./steps/StepGoalDetails"
import { StepLumpsum } from "./steps/StepLumpsum"
import { StepSip } from "./steps/StepSip"
import { StepOtherAssets } from "./steps/StepOtherAssets"
import { StepConfirmation } from "./steps/StepConfirmation"

const STEPS: OnboardingStepMeta[] = [
  { id: "profile", title: "About You", description: "Your age, retirement timeline, and family." },
  { id: "expenses", title: "Monthly Expenses", description: "Household spending and inflation assumptions." },
  { id: "goal-selection", title: "Select Goals", description: "Choose the financial goals you want to track." },
  { id: "goal-details", title: "Goal Details", description: "Configure target amounts and timelines for each goal." },
  { id: "lumpsum", title: "Lumpsum Investments", description: "One-time investments you have made." },
  { id: "sip", title: "SIP Investments", description: "Recurring monthly investments you are running." },
  { id: "other-assets", title: "Other Assets", description: "EPF, NPS, gold, silver, and emergency reserves." },
  { id: "confirmation", title: "Review & Confirm", description: "Verify everything before heading to your dashboard." },
]

// ── Validation ────────────────────────────────────────────
function isStepValid(stepId: string, data: OnboardingData): boolean {
  switch (stepId) {
    case "profile":
      return data.profile.currentAge > 0 && data.profile.retirementAge > 0 && data.profile.lifeExpectancy > 0
    case "expenses":
      return data.expenses.annualHouseholdExpense > 0 && data.expenses.expenseInflationPercent > 0
    case "goal-selection":
      return data.selectedGoals.length > 0
    case "goal-details":
      return validateGoalDetails(data)
    case "lumpsum":
      return validateEntries(data.lumpsumInvestments as unknown as Record<string, unknown>[], ["fundName", "amount", "dateOfInvestment", "units", "goalId"])
    case "sip":
      return validateEntries(data.sipInvestments as unknown as Record<string, unknown>[], ["fundName", "amount", "startDate", "unitsTillNow", "goalId"])
    case "other-assets":
      return true
    case "confirmation":
      return true
    default:
      return true
  }
}

function validateEntries(entries: Record<string, unknown>[], requiredKeys: string[]): boolean {
  if (entries.length === 0) return true
  return entries.every((entry) =>
    requiredKeys.every((key) => {
      const val = entry[key]
      if (typeof val === "string") return val.trim().length > 0
      if (typeof val === "number") return val > 0
      return !!val
    })
  )
}

function validateGoalDetails(data: OnboardingData): boolean {
  const { selectedGoals, goalDetails, customGoalDefinitions } = data

  for (const goal of selectedGoals) {
    switch (goal) {
      case "fire": {
        const f = goalDetails.fire
        if (!f || f.targetAge <= 0 || f.inflationAssumed <= 0) return false
        break
      }
      case "school-fees": {
        const arr = goalDetails.schoolFees
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((c) => c.currentSchoolFeeYearly <= 0 || c.expectedInflationYearly <= 0)) return false
        break
      }
      case "graduation": {
        const arr = goalDetails.graduation
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((g) => g.graduationCostCurrent <= 0 || g.expectedInflationYearly <= 0)) return false
        break
      }
      case "marriage": {
        const arr = goalDetails.marriage
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((m) => m.marriageCostCurrent <= 0 || m.yearsRemaining <= 0 || m.expectedInflationYearly <= 0)) return false
        break
      }
      case "house-down-payment": {
        const h = goalDetails.houseDownPayment
        if (!h || h.targetCost <= 0 || h.yearsRemaining <= 0) return false
        break
      }
      case "whitegoods": {
        const arr = goalDetails.whitegoods
        if (!Array.isArray(arr) || arr.length === 0) return false
        if (arr.some((w) => !w.itemName.trim() || w.currentCost <= 0 || w.replacementFrequencyYears <= 0)) return false
        break
      }
      case "custom": {
        const arr = goalDetails.custom
        if (!Array.isArray(arr) || arr.length < customGoalDefinitions.length) return false
        if (arr.some((c) => c.targetCost <= 0 || c.yearsRemaining <= 0)) return false
        break
      }
    }
  }
  return true
}

interface OnboardingFlowProps {
  onFinish: () => void
  onBack: () => void
}

export function OnboardingFlow({ onFinish, onBack }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(() => {
    const saved = localStorage.getItem("firecal-onboarding")
    return saved ? (JSON.parse(saved) as OnboardingData) : { ...DEFAULT_ONBOARDING_DATA }
  })

  function updateData(updates: Partial<OnboardingData>) {
    setData((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem("firecal-onboarding", JSON.stringify(next))
      return next
    })
  }

  const step = STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === STEPS.length - 1
  const progress = ((currentStep + 1) / STEPS.length) * 100
  const canProceed = isStepValid(step.id, data)

  function handleNext() {
    if (!canProceed) return
    if (step.id === "goal-details") {
      prefetchSchemeList()
      prefetchMetalPrices()
    }
    if (isLast) {
      onFinish()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  function handleBack() {
    if (isFirst) {
      onBack()
    } else {
      setCurrentStep((prev) => prev - 1)
    }
  }

  function renderStep() {
    const props = { data, updateData }
    switch (step.id) {
      case "profile": return <StepProfile {...props} />
      case "expenses": return <StepExpenses {...props} />
      case "goal-selection": return <StepGoalSelection {...props} />
      case "goal-details": return <StepGoalDetails {...props} />
      case "lumpsum": return <StepLumpsum {...props} />
      case "sip": return <StepSip {...props} />
      case "other-assets": return <StepOtherAssets {...props} />
      case "confirmation": return <StepConfirmation {...props} />
      default: return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-slate-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content card */}
      <div className="rounded-xl border border-border/60 bg-white/70 backdrop-blur-sm p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-rose-900">{step.title}</h3>
          <p className="text-sm font-medium text-slate-600">{step.description}</p>
        </div>

        {renderStep()}
      </div>

      {/* Validation hint */}
      {!canProceed && (
        <p className="text-xs text-red-500 text-center font-medium">
          Please fill all required fields before proceeding.
        </p>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
            !canProceed
              ? "bg-slate-300 cursor-not-allowed"
              : isLast
                ? "bg-rose-700 hover:bg-rose-800"
                : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isLast ? (
            <>
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentStep
                ? "w-6 bg-emerald-500"
                : idx < currentStep
                  ? "w-2 bg-emerald-300"
                  : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
