import type { DashboardPageProps } from "./types/Dashboard.types"
import { useDashboard } from "./hooks/useDashboard"
import { useFireCorpusTile } from "@/components/dashboard/hooks/useFireCorpusTile"
import { useMonthlySipsTile } from "@/components/dashboard/hooks/useMonthlySipsTile"
import { NetWorthTile } from "@/components/dashboard/NetWorthTile"
import { FireCorpusTile } from "@/components/dashboard/FireCorpusTile"
import { MonthlySipsTile } from "@/components/dashboard/MonthlySipsTile"
import { AssetAllocationTile } from "@/components/dashboard/AssetAllocationTile"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { NewGoalCard } from "@/components/dashboard/NewGoalCard"
import { GoalCard } from "@/components/dashboard/GoalCard"

export function Dashboard({ data, onEditPlan }: DashboardPageProps) {
  const { view, fire, isRefreshing, handleRefresh } = useDashboard(data)
  const fireCorpusTile = useFireCorpusTile()
  const monthlySipsTile = useMonthlySipsTile(view.sips)

  return (
    <div className="-mx-6 -mt-8 bg-gradient-to-br from-[#1A2E20] via-[#1E3528] to-[#162418] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        <DashboardNav />

        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-amber-400 text-lg mt-0.5">⚠</span>
          <p className="text-sm text-amber-200/90">
            <strong className="text-amber-300">LTCG harvest window open</strong> — ₹68,420 available
            to harvest tax-free before March 31.{" "}
            <button type="button" className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300">
              Review →
            </button>
          </p>
        </div>

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
          <AssetAllocationTile allocation={view.allocation} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Goals</h2>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                + New goal
              </button>
              <button type="button" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 border border-white/20 text-white/70 hover:bg-white/15 transition-colors">
                View detail →
              </button>
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
          <button
            type="button"
            onClick={onEditPlan}
            className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
          >
            Edit onboarding data
          </button>
        </div>
      </div>
    </div>
  )
}
