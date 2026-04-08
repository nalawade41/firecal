import { Home, Flame, IndianRupee } from "lucide-react"
import { formatINR } from "@/utils"
import { GlassPanel } from "@/components/ui/glass-panel"
import { MoneyValue } from "@/components/ui/money-value"

import type { CorpusBreakdownProps } from "../types/FireSummary.types"

export function CorpusBreakdown({ retirementLivingCorpus, totalGoalCorpus, totalRequiredCorpus }: CorpusBreakdownProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <GlassPanel className="!space-y-2">
        <div className="flex items-center gap-2.5">
          <Home className="h-5 w-5 text-[var(--wt-green)]" />
          <span className="text-sm font-medium text-[var(--wt-ink2)]">Retirement Living Corpus</span>
        </div>
        <p className="text-2xl font-medium"><MoneyValue>{formatINR(retirementLivingCorpus)}</MoneyValue></p>
        <p className="wt-hint">Min corpus at retirement to fund all expenses till life expectancy</p>
      </GlassPanel>

      <GlassPanel className="!space-y-2">
        <div className="flex items-center gap-2.5">
          <Flame className="h-5 w-5 text-[var(--wt-amber)]" />
          <span className="text-sm font-medium text-[var(--wt-ink2)]">Total Goal Corpus</span>
        </div>
        <p className="text-2xl font-medium"><MoneyValue>{formatINR(totalGoalCorpus)}</MoneyValue></p>
        <p className="wt-hint">Education + Marriage + Healthcare + Whitegoods + Travel</p>
      </GlassPanel>

      <GlassPanel variant="dark" className="!space-y-2">
        <div className="flex items-center gap-2.5">
          <IndianRupee className="h-5 w-5 text-[var(--wt-sage)]" />
          <span className="text-sm font-medium text-[var(--wt-ink2)]">Total Required Corpus</span>
        </div>
        <p className="text-2xl font-medium"><MoneyValue>{formatINR(totalRequiredCorpus)}</MoneyValue></p>
        <p className="wt-hint">Living + Goals combined</p>
      </GlassPanel>
    </div>
  )
}
