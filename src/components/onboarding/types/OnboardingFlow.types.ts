import type { OnboardingData, OnboardingStepMeta } from "@/types/onboarding"

export interface OnboardingFlowProps {
  onFinish: () => void
  onBack: () => void
}

export interface UseOnboardingFlowReturn {
  currentStep: number
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  step: OnboardingStepMeta
  isFirst: boolean
  isLast: boolean
  progress: number
  canProceed: boolean
  handleNext: () => void
  handleBack: () => void
}
