import type { DashboardView, FireCorpusView } from "@/types/dashboard"
import type { OnboardingData } from "@/types/onboarding"

export interface DashboardPageProps {
  data: OnboardingData
  onEditPlan: () => void
}

export interface UseDashboardReturn {
  view: DashboardView
  fire: FireCorpusView
  isRefreshing: boolean
  isAllocLoading: boolean
  handleRefresh: () => Promise<void>
}
