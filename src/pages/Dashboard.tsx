import { useState, useCallback } from "react"
import type { OnboardingData } from "@/types/onboarding"
import type { DashboardView } from "@/types/dashboard"
import { calculateNetWorth, refreshNetWorthData } from "@/engine/tracking/net-worth"
import { calculateFireDashboard, type FireTargetType } from "@/engine/tracking/fire-calculation"
import { calculateMonthlySips } from "@/engine/tracking/sip-calculation"
import { formatINR } from "@/lib/utils"
import { NetWorthTile } from "@/components/dashboard/NetWorthTile"
import { FireCorpusTile } from "@/components/dashboard/FireCorpusTile"
import { MonthlySipsTile } from "@/components/dashboard/MonthlySipsTile"
import { AssetAllocationTile } from "@/components/dashboard/AssetAllocationTile"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { NewGoalCard } from "@/components/dashboard/NewGoalCard"
import { GoalCard } from "@/components/dashboard/GoalCard"

// ── Mock data (will be replaced with computed data later) ──
const MOCK: DashboardView = {
  netWorth: {
    total: "₹1,52,40,000",
    calculatedAt: new Date().toISOString(),
    missingNavCount: 0,
    breakdown: [
      { label: "MF portfolio", value: "₹82.4 L" },
      { label: "EPF + NPS", value: "₹37.1 L" },
      { label: "Gold", value: "₹8.2 L" },
      { label: "Emergency", value: "₹14.0 L" },
    ],
  },
  fire: {
    currentCorpus: "₹36.2 L",
    targetCorpus: "₹5.0 Cr",
    currentAge: 37,
    targetAge: 45,
    progressPercent: 7.2,
    gap: "₹4.64 Cr",
    reqCagr: "42.8%",
  },
  sips: {
    totalAmount: "₹45,000",
    sipCount: 5,
    pendingCount: 1,
    items: [
      { label: "FIRE · PPFAS Flexi Cap", amount: "₹20,000", status: "processed", dotColor: "#2D8A50" },
      { label: "FIRE · Axis Nifty 100", amount: "₹10,000", status: "pending", dotColor: "#60A5FA" },
      { label: "Reyaansh Grad", amount: "₹8,000", status: "processed", dotColor: "#A78BFA" },
      { label: "Kid2 Grad", amount: "₹7,000", status: "processed", dotColor: "#FB923C" },
    ],
    closedTotalAmount: "₹0",
    closedCount: 0,
    closedItems: [],
  },
  allocation: {
    equityPercent: 62,
    segments: [
      { label: "Large cap", percent: 39, color: "#2D8A50" },
      { label: "Mid cap", percent: 14, color: "#2563EB" },
      { label: "Small cap", percent: 9, color: "#EA580C" },
      { label: "International", percent: 5, color: "#7C3AED" },
      { label: "Debt + Gold", percent: 24, color: "#64748B" },
    ],
  },
  goals: [
    {
      id: "fire",
      icon: "🔥",
      name: "FIRE",
      status: "monitor",
      targetLabel: "Target ₹5.0 Cr · Age 45",
      currentValue: "₹36.2 L",
      progressPercent: 7.2,
      gap: "Gap ₹4.64 Cr",
      borderColor: "#2D8A50",
      iconBg: "#E8F5E9",
    },
    {
      id: "school",
      icon: "🏫",
      name: "R. School",
      status: "on-track",
      targetLabel: "Target ₹19 L · 2036",
      currentValue: "₹11.8 L",
      progressPercent: 62,
      gap: "Gap ₹7.2 L",
      borderColor: "#7B3FA0",
      iconBg: "#F5EEF8",
    },
    {
      id: "grad",
      icon: "🎓",
      name: "R. Grad",
      status: "on-track",
      targetLabel: "Target ₹53.9 L · 2037",
      currentValue: "₹14.1 L",
      progressPercent: 26,
      gap: "Gap ₹39.8 L",
      borderColor: "#C87820",
      iconBg: "#EFF6FF",
    },
  ],
}

// ── Props ──────────────────────────────────────────────────
interface DashboardProps {
  data: OnboardingData
  onEditPlan: () => void
}

// ── Main component ─────────────────────────────────────────
export function Dashboard({ data, onEditPlan }: DashboardProps) {
  const [nwCalc, setNwCalc] = useState(() => calculateNetWorth(data))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fireTargetType, setFireTargetType] = useState<FireTargetType>("suggested")

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const { calculation } = await refreshNetWorthData(data)
    setNwCalc(calculation)
    setIsRefreshing(false)
  }, [data])

  // Build net worth view for the tile
  const computedNetWorth = {
    total: formatINR(nwCalc.total),
    calculatedAt: nwCalc.calculatedAt,
    missingNavCount: nwCalc.missingNavCount,
    breakdown: [
      { label: "MF portfolio", value: formatINR(nwCalc.mfPortfolio) },
      { label: "EPF + NPS", value: formatINR(nwCalc.epfNps) },
      { label: "Gold", value: formatINR(nwCalc.preciousMetals) },
      { label: "Emergency", value: formatINR(nwCalc.liquid) },
    ],
  }

  // Calculate FIRE data based on selected target type
  const fireCalculation = calculateFireDashboard(data, fireTargetType)
  const computedFire = {
    currentCorpus: formatINR(fireCalculation.currentCorpus),
    targetCorpus: formatINR(fireCalculation.targetCorpus),
    currentAge: fireCalculation.currentAge,
    targetAge: fireCalculation.targetAge,
    progressPercent: fireCalculation.progressPercent,
    gap: formatINR(fireCalculation.gap),
    reqCagr: `${fireCalculation.reqCagr}%`,
    targetSip: formatINR(fireCalculation.targetSip),
    lumpsumNeeded: formatINR(fireCalculation.lumpsumNeeded),
    targetType: fireTargetType,
    onTargetChange: setFireTargetType,
  }

  // Calculate Monthly SIPs data
  const sipsCalculation = calculateMonthlySips(data)

  const view: DashboardView = {
    ...MOCK,
    netWorth: computedNetWorth,
    sips: sipsCalculation,
  }

  return (
    <div className="-mx-6 -mt-8 bg-gradient-to-br from-[#1A2E20] via-[#1E3528] to-[#162418] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Top nav */}
        <DashboardNav />

        {/* LTCG alert */}
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

        {/* Row 1: Net Worth + FIRE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <NetWorthTile nw={view.netWorth} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
          <FireCorpusTile fire={computedFire} />
        </div>

        {/* Row 2: Monthly SIPs + Asset Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MonthlySipsTile sips={view.sips} />
          <AssetAllocationTile allocation={view.allocation} />
        </div>

        {/* Row 3: Goals */}
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

        {/* Edit plan link */}
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
