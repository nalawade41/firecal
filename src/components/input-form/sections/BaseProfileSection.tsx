import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { BaseProfileSectionProps } from "../types/InputForm.types"

export function BaseProfileSection({ data, update }: BaseProfileSectionProps) {
  return (
    <SectionCard title="Base Profile" description="Your age and retirement timeline">
      <NumberField
        label="Current Year"
        value={data.currentYear}
        onChange={(v) => update("currentYear", v)}
      />
      <NumberField
        label="Current Age"
        value={data.currentAge}
        onChange={(v) => update("currentAge", v)}
        min={18}
        max={100}
      />
      <NumberField
        label="Retirement Age"
        value={data.retirementAge}
        onChange={(v) => update("retirementAge", v)}
        min={30}
        max={100}
      />
      <NumberField
        label="Life Expectancy Age"
        value={data.lifeExpectancyAge}
        onChange={(v) => update("lifeExpectancyAge", v)}
        min={50}
        max={120}
      />
    </SectionCard>
  )
}
