import { formatINR } from "@/utils"
import { GlassPanel } from "@/components/ui/glass-panel"
import { MoneyValue } from "@/components/ui/money-value"

import type { GoalPlanningSectionProps } from "../types/FireSummary.types"
import { CATEGORY_ICONS } from "../constants/FireSummary.constants"
import { CategorySection } from "./CategorySection"

export function GoalPlanningSection({
  totalGoalLumpsumToday,
  totalGoalCorpus,
  longestGoalHorizonYears,
  goalCategories,
  goalMonthlySipTotal,
}: GoalPlanningSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium tracking-tight text-[var(--wt-ink)]">Goal-Based Planning</h3>

      <GlassPanel variant="dark">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="wt-label mb-1">Total Lumpsum Today</p>
            <p className="text-xl font-medium text-[var(--wt-green)]"><MoneyValue>{formatINR(totalGoalLumpsumToday)}</MoneyValue></p>
            <p className="wt-hint mt-0.5">One-time investment to cover all goals</p>
          </div>
          <div>
            <p className="wt-label mb-1">Total Monthly SIP (Goals)</p>
            <p className="text-xl font-medium text-[var(--wt-green)]"><MoneyValue>{formatINR(goalMonthlySipTotal)}</MoneyValue></p>
            <p className="wt-hint mt-0.5">For up to {longestGoalHorizonYears} years</p>
          </div>
          <div>
            <p className="wt-label mb-1">Total Future Cost (Goals)</p>
            <p className="text-xl font-medium text-[var(--wt-green)]"><MoneyValue>{formatINR(totalGoalCorpus)}</MoneyValue></p>
            <p className="wt-hint mt-0.5">Inflated cost of all goals combined</p>
          </div>
        </div>
      </GlassPanel>

      {goalCategories.map((cat) => (
        <CategorySection key={cat.category} cat={cat} icon={CATEGORY_ICONS[cat.category]} />
      ))}
    </div>
  )
}
