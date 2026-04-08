import { TrendingUp } from "lucide-react"
import type { StepProps } from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"
import { AlertPanel } from "@/components/ui/alert-panel"
import { formatINR } from "@/utils"
import { useStepExpenses } from "./hooks/useStepExpenses"

export function StepExpenses(props: StepProps) {
  const { data } = props
  const { update, corpusRequired, expenseAtRetirement, swrUsed } = useStepExpenses(props)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberField
          label="Monthly Household Expense"
          value={data.expenses.annualHouseholdExpense}
          onChange={(v) => update("annualHouseholdExpense", v)}
          suffix="₹"
        />
        <NumberField
          label="Expense Inflation"
          value={data.expenses.expenseInflationPercent}
          onChange={(v) => update("expenseInflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Retirement Adjustment Factor"
          value={data.expenses.retirementAdjustmentFactor}
          onChange={(v) => update("retirementAdjustmentFactor", v)}
          step={0.05}
          min={0.1}
          max={2}
        />
      </div>

      <p className="text-xs text-slate-500">
        Retirement adjustment factor is optional — defaults to 1.0 (no change in spending at retirement).
      </p>

      {/* Runtime FIRE corpus estimate */}
      {corpusRequired > 0 && (
        <AlertPanel
          variant="green"
          icon={<TrendingUp className="h-5 w-5 flex-shrink-0" />}
          title={`Estimated FIRE corpus: ${formatINR(corpusRequired)}`}
        >
          <p className="text-[11px] leading-relaxed opacity-80">
            At retirement your annual expense will be ~{formatINR(expenseAtRetirement)}.
            Using a {swrUsed * 100}% safe withdrawal rate (SWP), you need this corpus to
            fund <em>only</em> household expenses. Other goals (education, house, etc.) are not included.
          </p>
        </AlertPanel>
      )}
    </div>
  )
}
