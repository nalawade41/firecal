import { Button } from "@/components/ui/button"
import { AlertPanel } from "@/components/ui/alert-panel"
import type { DashboardPageProps } from "./types/Dashboard.types"
import { useDashboard } from "./hooks/useDashboard"
import { useFireCorpusTile } from "@/components/tracking/dashboard/hooks/useFireCorpusTile"
import { useMonthlySipsTile } from "@/components/tracking/dashboard/hooks/useMonthlySipsTile"
import {
  NetWorthTile, FireCorpusTile, MonthlySipsTile,
  AssetAllocationTile, DashboardNav, NewGoalCard, GoalCard,
} from "@/components/tracking/dashboard"

export function Dashboard({ data, onEditPlan }: DashboardPageProps) {
  const { view, fire, isRefreshing, isAllocLoading, handleRefresh } = useDashboard(data)
  const fireCorpusTile = useFireCorpusTile()
  const monthlySipsTile = useMonthlySipsTile(view.sips)

  return (
    <div className="-mx-6 -mt-8 wt-bg-mesh min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        <DashboardNav />

        <AlertPanel variant="amber" className="bg-amber-500/10 border-amber-500/20 text-amber-200/90">
          <p>
            <strong className="text-amber-300">LTCG harvest window open</strong> — ₹68,420 available
            to harvest tax-free before March 31.{" "}
            <Button variant="link" className="text-amber-400 font-medium p-0 h-auto">Review →</Button>
          </p>
        </AlertPanel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <NetWorthTile nw={view.netWorth} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          <FireCorpusTile
            fire={fire}
            showTooltip={fireCorpusTile.showTooltip}
            onTooltipEnter={fireCorpusTile.onTooltipEnter}
            onTooltipLeave={fireCorpusTile.onTooltipLeave}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MonthlySipsTile
            sips={view.sips}
            filter={monthlySipsTile.filter}
            onFilterChange={monthlySipsTile.setFilter}
            displayItems={monthlySipsTile.displayItems}
            displayCount={monthlySipsTile.displayCount}
            displayTotal={monthlySipsTile.displayTotal}
          />
          <AssetAllocationTile allocation={view.allocation} isLoading={isAllocLoading} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Goals</h2>
            <div className="flex gap-2">
              <Button size="sm" className="wt-btn wt-btn-primary">+ New goal</Button>
              <Button size="sm" variant="outline" className="wt-btn-outline-light">View detail →</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {view.goals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
            <NewGoalCard />
          </div>
        </div>

        <div className="pt-2 pb-8 text-center">
          <Button variant="link" onClick={onEditPlan} className="text-xs text-white/40 hover:text-white/70">
            Edit onboarding data
          </Button>
        </div>
      </div>
    </div>
  )
}
