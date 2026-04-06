import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { ExpenseProfileSectionProps } from "../types/InputForm.types"

export function ExpenseProfileSection({ data, update }: ExpenseProfileSectionProps) {
  return (
    <SectionCard title="Expense Profile" description="Annual household expenses and inflation">
      <NumberField
        label="Annual Household Expense"
        value={data.currentAnnualHouseholdExpense}
        onChange={(v) => update("currentAnnualHouseholdExpense", v)}
        suffix="₹"
      />
      <NumberField
        label="Expense Inflation"
        value={data.expenseInflationPercent}
        onChange={(v) => update("expenseInflationPercent", v)}
        suffix="%"
        step={0.5}
      />
      <NumberField
        label="Retirement Adjustment Factor"
        value={data.expenseAdjustmentFactorAtRetirement}
        onChange={(v) => update("expenseAdjustmentFactorAtRetirement", v)}
        step={0.05}
        min={0.1}
        max={1.5}
      />
    </SectionCard>
  )
}
