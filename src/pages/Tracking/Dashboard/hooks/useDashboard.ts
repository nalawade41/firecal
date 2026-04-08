import { useState, useCallback, useEffect } from "react"
import type { OnboardingData } from "@/types/onboarding"
import type { DashboardView, FireTargetType, FireCorpusView, AssetAllocationView, AllocationSegment } from "@/types/dashboard"
import type { PortfolioAllocationResult, AssetBucket } from "@/types/asset-allocation"
import { calculateNetWorth, refreshNetWorthData } from "@/engine/tracking/net-worth"
import { calculateFireDashboard } from "@/engine/tracking/fire-calculation"
import { calculateMonthlySips } from "@/engine/tracking/sip-calculation"
import { computePortfolioAllocation } from "@/engine/tracking/asset-allocation"
import { formatINR } from "@/utils"
import { MOCK_DASHBOARD } from "../constants/DashboardPage.constants"
import type { UseDashboardReturn } from "../types/Dashboard.types"

const BUCKET_LABELS: Record<AssetBucket, string> = {
  large_cap: "Large Cap",
  mid_cap: "Mid Cap",
  small_cap: "Small Cap",
  international: "International",
  debt: "Debt",
  gold: "Gold",
  silver: "Silver",
}

const BUCKET_COLORS: Record<AssetBucket, string> = {
  large_cap: "#2D8A50",
  mid_cap: "#2563EB",
  small_cap: "#EA580C",
  international: "#7C3AED",
  debt: "#64748B",
  gold: "#F59E0B",
  silver: "#94A3B8",
}

const EMPTY_ALLOCATION: AssetAllocationView = {
  equityPercent: 0,
  segments: [],
}

function toAllocationView(result: PortfolioAllocationResult): AssetAllocationView {
  const segments: AllocationSegment[] = (Object.keys(result.bucketPercents) as AssetBucket[])
    .filter(b => result.bucketPercents[b] > 0)
    .map(b => ({
      label: BUCKET_LABELS[b],
      percent: result.bucketPercents[b],
      color: BUCKET_COLORS[b],
    }))

  return {
    equityPercent: Math.round(result.equityPercent),
    segments,
  }
}

export function useDashboard(data: OnboardingData): UseDashboardReturn {
  const [nwCalc, setNwCalc] = useState(() => calculateNetWorth(data))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fireTargetType, setFireTargetType] = useState<FireTargetType>("suggested")
  const [allocationResult, setAllocationResult] = useState<PortfolioAllocationResult | null>(null)
  const [isAllocLoading, setIsAllocLoading] = useState(true)

  // Auto-refresh NAVs + metal prices on mount so dashboard shows live values
  useEffect(() => {
    let cancelled = false

    async function init() {
      setIsRefreshing(true)
      setIsAllocLoading(true)

      const [{ calculation }, allocResult] = await Promise.all([
        refreshNetWorthData(data),
        computePortfolioAllocation(data).catch(() => null),
      ])

      if (!cancelled) {
        setNwCalc(calculation)
        if (allocResult) setAllocationResult(allocResult)
        setIsRefreshing(false)
        setIsAllocLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [data])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const { calculation } = await refreshNetWorthData(data)
    setNwCalc(calculation)

    try {
      const allocResult = await computePortfolioAllocation(data)
      setAllocationResult(allocResult)
    } catch {
      // Keep existing allocation on refresh failure
    }

    setIsRefreshing(false)
  }, [data])

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

  const fireCalculation = calculateFireDashboard(data, fireTargetType)
  const fire: FireCorpusView = {
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

  const sipsCalculation = calculateMonthlySips(data)

  const allocation = allocationResult
    ? toAllocationView(allocationResult)
    : EMPTY_ALLOCATION

  const view: DashboardView = {
    ...MOCK_DASHBOARD,
    netWorth: computedNetWorth,
    sips: sipsCalculation,
    allocation,
    allocationDetail: allocationResult,
  }

  return { view, fire, isRefreshing, isAllocLoading, handleRefresh }
}
