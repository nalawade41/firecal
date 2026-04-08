import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { TravelSectionProps } from "../types/FireForm.types"

export function TravelSection({ data, update }: TravelSectionProps) {
  return (
    <SectionCard title="Travel & Hobbies" description="Annual travel budget">
      <NumberField
        label="Annual Travel Cost"
        value={data.currentAnnualCost}
        onChange={(v) => update("currentAnnualCost", v)}
        suffix="₹"
      />
      <NumberField
        label="Travel Inflation"
        value={data.inflationPercent}
        onChange={(v) => update("inflationPercent", v)}
        suffix="%"
        step={0.5}
      />
      <NumberField
        label="Stop Age"
        value={data.stopAge}
        onChange={(v) => update("stopAge", v)}
      />
    </SectionCard>
  )
}
