import { Upload, FileJson, PenLine } from "lucide-react"
import { OnboardingFlow } from "@/components/tracking/onboarding"
import { Dashboard } from "./Dashboard/DashboardPage"
import { GlassPanel } from "@/components/ui/glass-panel"
import { Button } from "@/components/ui/button"
import { useTracking } from "./hooks/useTracking"

export function TrackingPage() {
  const { saved, view, setView, handleFinishOnboarding, handleStartFreshSetup } = useTracking()

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
        <GlassPanel className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-[var(--wt-blue-light)] flex items-center justify-center">
            <FileJson className="h-6 w-6 text-[var(--wt-blue)]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Upload JSON File</h3>
            <p className="text-xs text-muted-foreground">
              Already have your portfolio data exported? Upload the JSON file to
              import everything at once.
            </p>
          </div>
          <Button
            type="button"
            className="mt-auto w-full"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </GlassPanel>

        <GlassPanel className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-[var(--wt-green-light)] flex items-center justify-center">
            <PenLine className="h-6 w-6 text-[var(--wt-green)]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Enter Data Manually</h3>
            <p className="text-xs text-muted-foreground">
              Walk through a guided setup to enter your portfolio details,
              goals, and preferences step by step.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleStartFreshSetup}
            className="mt-auto w-full"
          >
            <PenLine className="h-4 w-4" />
            Start Setup
          </Button>
        </GlassPanel>
      </div>
    </div>
  )
}
