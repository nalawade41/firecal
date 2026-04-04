import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import type { StepProps } from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"
import { computeFireCorpus } from "@/engine"

function formatINR(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function StepExpenses({ data, updateData }: StepProps) {
  function update<K extends keyof typeof data.expenses>(key: K, value: typeof data.expenses[K]) {
    updateData({ expenses: { ...data.expenses, [key]: value } })
  }

  const fireResult = useMemo(
    () =>
      computeFireCorpus(
        {
          currentAge: data.profile.currentAge,
          retirementAge: data.profile.retirementAge,
          lifeExpectancyAge: data.profile.lifeExpectancy,
        },
        {
          currentAnnualHouseholdExpense: data.expenses.annualHouseholdExpense * 12,
          expenseInflationPercent: data.expenses.expenseInflationPercent,
          expenseAdjustmentFactorAtRetirement: data.expenses.retirementAdjustmentFactor,
        },
      ),
    [
      data.expenses.annualHouseholdExpense,
      data.expenses.expenseInflationPercent,
      data.expenses.retirementAdjustmentFactor,
      data.profile.currentAge,
      data.profile.retirementAge,
      data.profile.lifeExpectancy,
    ],
  )

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
      {fireResult.corpusRequired > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-900">
              Estimated FIRE corpus: <span className="text-base">{formatINR(fireResult.corpusRequired)}</span>
            </p>
            <p className="text-[11px] text-emerald-700/80 leading-relaxed">
              At retirement your annual expense will be ~{formatINR(fireResult.expenseAtRetirement)}.
              Using a {fireResult.swrUsed * 100}% safe withdrawal rate (SWP), you need this corpus to
              fund <em>only</em> household expenses. Other goals (education, house, etc.) are not included.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
