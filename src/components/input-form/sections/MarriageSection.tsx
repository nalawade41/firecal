import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { MarriageSectionProps } from "../types/InputForm.types"

export function MarriageSection({ data, update }: MarriageSectionProps) {
  return (
    <SectionCard title="Marriage" description="Per-child marriage cost">
      <NumberField
        label="Cost Per Child"
        value={data.currentCostPerChild}
        onChange={(v) => update("currentCostPerChild", v)}
        suffix="₹"
      />
      <NumberField
        label="Marriage Inflation"
        value={data.inflationPercent}
        onChange={(v) => update("inflationPercent", v)}
        suffix="%"
        step={0.5}
      />
    </SectionCard>
  )
}
