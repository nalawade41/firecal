import { useState, useCallback } from "react"
import type { OnboardingData } from "@/types/onboarding"
import type { TrackingView, UseTrackingReturn } from "../types/Tracking.types"
import { ONBOARDING_STORAGE_KEY } from "../constants/Tracking.constants"

function loadOnboardingData(): OnboardingData | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OnboardingData
    if (!parsed.selectedGoals || parsed.selectedGoals.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

export function useTracking(): UseTrackingReturn {
  const [saved, setSaved] = useState<OnboardingData | null>(() => loadOnboardingData())
  const [view, setView] = useState<TrackingView>(saved ? "dashboard" : "home")

  const handleFinishOnboarding = useCallback(() => {
    setSaved(loadOnboardingData())
    setView("dashboard")
  }, [])

  return { saved, view, setView, handleFinishOnboarding }
}
