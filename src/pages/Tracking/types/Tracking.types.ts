import type { OnboardingData } from "@/types/onboarding"

export type TrackingView = "home" | "onboarding" | "dashboard"

export interface UseTrackingReturn {
  saved: OnboardingData | null
  view: TrackingView
  setView: (view: TrackingView) => void
  handleFinishOnboarding: () => void
}
