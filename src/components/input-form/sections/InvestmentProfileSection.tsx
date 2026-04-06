import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { InvestmentProfileSectionProps } from "../types/InputForm.types"

export function InvestmentProfileSection({ data, update }: InvestmentProfileSectionProps) {
  return (
    <SectionCard title="Investment Profile" description="Portfolio and annual savings">
      <NumberField
        label="Current Portfolio Value"
        value={data.currentPortfolioValue}
        onChange={(v) => update("currentPortfolioValue", v)}
        suffix="₹"
      />
      <NumberField
        label="Annual Savings"
        value={data.annualSavings}
        onChange={(v) => update("annualSavings", v)}
        suffix="₹"
      />
      <NumberField
        label="Annual Savings Increase"
        value={data.annualSavingsIncreasePercent}
        onChange={(v) => update("annualSavingsIncreasePercent", v)}
        suffix="%"
        step={0.5}
      />
    </SectionCard>
  )
}
