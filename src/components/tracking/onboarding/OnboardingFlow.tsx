import { ArrowLeft, ArrowRight, LayoutDashboard } from "lucide-react"
import { StepProfile } from "./steps/StepProfile"
import { StepExpenses } from "./steps/StepExpenses"
import { StepGoalSelection } from "./steps/StepGoalSelection"
import { StepGoalDetails } from "./steps/StepGoalDetails"
import { StepLumpsum } from "./steps/StepLumpsum"
import { StepSip } from "./steps/StepSip"
import { StepOtherAssets } from "./steps/StepOtherAssets"
import { StepConfirmation } from "./steps/StepConfirmation"
import { ONBOARDING_STEPS } from "./constants/OnboardingFlow.constants"
import type { OnboardingFlowProps } from "./types/OnboardingFlow.types"
import { useOnboardingFlow } from "./hooks/useOnboardingFlow"

function renderStep(stepId: string, props: { data: ReturnType<typeof useOnboardingFlow>["data"]; updateData: ReturnType<typeof useOnboardingFlow>["updateData"] }) {
  switch (stepId) {
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

export function OnboardingFlow(props: OnboardingFlowProps) {
  const {
    currentStep, data, updateData, step,
    isLast, progress, canProceed,
    handleNext, handleBack,
  } = useOnboardingFlow(props)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[var(--wt-ink2)]">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </span>
          <span className="text-slate-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--wt-divider)] overflow-hidden">
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
          <p className="text-sm font-medium text-[var(--wt-ink2)]">{step.description}</p>
        </div>

        {renderStep(step.id, { data, updateData })}
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--wt-ink2)] bg-white border border-[var(--wt-input-border)] hover:bg-[var(--wt-foam)] transition-colors"
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
              ? "bg-[var(--wt-divider)] cursor-not-allowed"
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
        {ONBOARDING_STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentStep
                ? "w-6 bg-emerald-500"
                : idx < currentStep
                  ? "w-2 bg-emerald-300"
                  : "w-2 bg-[var(--wt-divider)]"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
