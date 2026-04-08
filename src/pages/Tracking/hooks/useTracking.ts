import { useState, useCallback } from "react"
import type { OnboardingData } from "@/types/onboarding"
import type { TrackingView, UseTrackingReturn } from "../types/Tracking.types"
import { readJSON, removeKey, ONBOARDING_KEY } from "@/store"

function loadOnboardingData(): OnboardingData | null {
  const parsed = readJSON<OnboardingData>(ONBOARDING_KEY)
  if (!parsed?.selectedGoals || parsed.selectedGoals.length === 0) return null
  return parsed
}

export function useTracking(): UseTrackingReturn {
  const [saved, setSaved] = useState<OnboardingData | null>(() => loadOnboardingData())
  const [view, setView] = useState<TrackingView>(saved ? "dashboard" : "home")

  const handleFinishOnboarding = useCallback(() => {
    setSaved(loadOnboardingData())
    setView("dashboard")
  }, [])

  const handleStartFreshSetup = useCallback(() => {
    removeKey(ONBOARDING_KEY)
    setView("onboarding")
  }, [])

  return { saved, view, setView, handleFinishOnboarding, handleStartFreshSetup }
}
