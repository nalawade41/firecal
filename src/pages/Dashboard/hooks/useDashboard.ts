import { useState, useCallback } from "react"
import type { OnboardingData } from "@/types/onboarding"
import type { DashboardView, FireTargetType, FireCorpusView } from "@/types/dashboard"
import { calculateNetWorth, refreshNetWorthData } from "@/engine/tracking/net-worth"
import { calculateFireDashboard } from "@/engine/tracking/fire-calculation"
import { calculateMonthlySips } from "@/engine/tracking/sip-calculation"
import { formatINR } from "@/lib/utils"
import { MOCK_DASHBOARD } from "../constants/Dashboard.constants"
import type { UseDashboardReturn } from "../types/Dashboard.types"


export function useDashboard(data: OnboardingData): UseDashboardReturn {
  const [nwCalc, setNwCalc] = useState(() => calculateNetWorth(data))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fireTargetType, setFireTargetType] = useState<FireTargetType>("suggested")

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const { calculation } = await refreshNetWorthData(data)
    setNwCalc(calculation)
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

  const view: DashboardView = {
    ...MOCK_DASHBOARD,
    netWorth: computedNetWorth,
    sips: sipsCalculation,
  }

  return { view, fire, isRefreshing, handleRefresh }
}
