import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { GoalInvestmentSectionProps } from "../types/FireForm.types"

export function GoalInvestmentSection({ data, update }: GoalInvestmentSectionProps) {
  return (
    <SectionCard title="Goal-Based Investment" description="Equity/debt allocation and returns for goal planning (SIP & lumpsum calculations)">
      <NumberField
        label="Equity Allocation"
        value={data.equityPercent}
        onChange={(v) => {
          update("equityPercent", v)
          update("debtPercent", 100 - v)
        }}
        suffix="%"
        min={0}
        max={100}
      />
      <NumberField
        label="Debt Allocation"
        value={data.debtPercent}
        onChange={(v) => {
          update("debtPercent", v)
          update("equityPercent", 100 - v)
        }}
        suffix="%"
        min={0}
        max={100}
      />
      <NumberField
        label="Goal Equity Return"
        value={data.equityReturnPercent}
        onChange={(v) => update("equityReturnPercent", v)}
        suffix="%"
        step={0.5}
      />
      <NumberField
        label="Goal Debt Return"
        value={data.debtReturnPercent}
        onChange={(v) => update("debtReturnPercent", v)}
        suffix="%"
        step={0.5}
      />
    </SectionCard>
  )
}
