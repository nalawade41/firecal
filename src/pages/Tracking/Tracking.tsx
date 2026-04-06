import { Upload, FileJson, PenLine } from "lucide-react"
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow"
import { Dashboard } from "@/pages/Dashboard"
import { useTracking } from "./hooks/useTracking"
import { ONBOARDING_STORAGE_KEY } from "./constants/Tracking.constants"

export function TrackingPage() {
  const { saved, view, setView, handleFinishOnboarding } = useTracking()

  if (view === "onboarding") {
    return (
      <OnboardingFlow
        onFinish={handleFinishOnboarding}
        onBack={() => setView(saved ? "dashboard" : "home")}
      />
    )
  }

  if (view === "dashboard" && saved) {
    return (
      <Dashboard
        data={saved}
        onEditPlan={() => setView("onboarding")}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-rose-900 tracking-tight">Portfolio Tracking</h2>
        <p className="text-base font-semibold text-rose-800">
          Import your portfolio data to get started with goal tracking,
          NAV updates, and LTCG harvesting insights.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-white/70 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileJson className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Upload JSON File</h3>
            <p className="text-xs text-muted-foreground">
              Already have your portfolio data exported? Upload the JSON file to
              import everything at once.
            </p>
          </div>
          <button
            type="button"
            className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
        </div>

        <div className="rounded-xl border border-border/60 bg-white/70 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <PenLine className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Enter Data Manually</h3>
            <p className="text-xs text-muted-foreground">
              Walk through a guided setup to enter your portfolio details,
              goals, and preferences step by step.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { localStorage.removeItem(ONBOARDING_STORAGE_KEY); setView("onboarding") }}
            className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <PenLine className="h-4 w-4" />
            Start Setup
          </button>
        </div>
      </div>
    </div>
  )
}
