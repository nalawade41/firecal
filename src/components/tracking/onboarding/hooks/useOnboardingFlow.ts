import { useState } from "react"
import type { OnboardingData } from "@/types/onboarding"
import { DEFAULT_ONBOARDING_DATA } from "@/types/onboarding"
import { readJSON, writeJSON, ONBOARDING_KEY } from "@/store"
import { prefetchSchemeList } from "./useMfSchemes"
import { prefetchMetalPrices } from "@/services/metal-api"
import { ONBOARDING_STEPS } from "../constants/OnboardingFlow.constants"
import type { OnboardingFlowProps, UseOnboardingFlowReturn } from "../types/OnboardingFlow.types"
import { isStepValid } from "../utils/onboardingValidation"

export function useOnboardingFlow({ onFinish, onBack }: OnboardingFlowProps): UseOnboardingFlowReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(() => {
    return readJSON<OnboardingData>(ONBOARDING_KEY) ?? { ...DEFAULT_ONBOARDING_DATA }
  })

  function updateData(updates: Partial<OnboardingData>) {
    setData((prev) => {
      const next = { ...prev, ...updates }
      writeJSON(ONBOARDING_KEY, next)
      return next
    })
  }

  const step = ONBOARDING_STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === ONBOARDING_STEPS.length - 1
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
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

  return {
    currentStep, data, updateData, step,
    isFirst, isLast, progress, canProceed,
    handleNext, handleBack,
  }
}
