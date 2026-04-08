import { TrendingUp, AlertTriangle, CheckCircle, IndianRupee } from "lucide-react"
import { formatINR } from "@/utils"
import { GlassPanel } from "@/components/ui/glass-panel"
import { MoneyValue } from "@/components/ui/money-value"
import { StatBox } from "@/components/ui/stat-box"

import type { PortfolioGapProps } from "../types/FireSummary.types"

export function PortfolioGap({
  portfolioAtRetirement,
  corpusGap,
  livingCorpusGap,
  goalCorpusGap,
  totalGoalLumpsumToday,
  totalMonthlySipRequired,
  totalAnnualSipRequired,
}: PortfolioGapProps) {
  const gap = corpusGap

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <GlassPanel className="!space-y-2">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-5 w-5 text-[var(--wt-green)]" />
          <span className="text-sm font-medium text-[var(--wt-ink2)]">Portfolio at Retirement</span>
        </div>
        <p className="text-2xl font-medium"><MoneyValue>{formatINR(portfolioAtRetirement)}</MoneyValue></p>
      </GlassPanel>

      <StatBox
        label={gap > 0 ? "Corpus Shortfall" : "Corpus Surplus"}
        value={`${gap > 0 ? "−" : "+"}${formatINR(Math.abs(gap))}`}
        color={gap > 0 ? "red" : "green"}
        size="lg"
        subtext={
          gap > 0 ? (
            <>
              {livingCorpusGap > 0 && (
                <span className="block">Living shortfall: {formatINR(livingCorpusGap)}</span>
              )}
              {goalCorpusGap > 0 && (
                <span className="block">Goal shortfall: {formatINR(goalCorpusGap)}</span>
              )}
            </>
          ) : "Portfolio exceeds total required corpus"
        }
      />

      <StatBox
        label="Total Monthly SIP"
        value={formatINR(totalMonthlySipRequired)}
        subtext={`Annual: ${formatINR(totalAnnualSipRequired)}`}
        color="blue"
        size="lg"
      />
    </div>
  )
}
