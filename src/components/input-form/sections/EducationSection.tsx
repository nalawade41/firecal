import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { EducationSectionProps } from "../types/InputForm.types"

export function EducationSection({ data, update }: EducationSectionProps) {
  return (
    <>
      <SectionCard title="Education — School" description="Annual school fee, shared across children">
        <NumberField
          label="Current Annual Fee"
          value={data.school.currentAnnualFee}
          onChange={(v) => update("school", "currentAnnualFee", v)}
          suffix="₹"
        />
        <NumberField
          label="School Inflation"
          value={data.school.inflationPercent}
          onChange={(v) => update("school", "inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Duration"
          value={data.school.durationYears}
          onChange={(v) => update("school", "durationYears", v)}
          suffix="years"
        />
      </SectionCard>

      <SectionCard title="Education — Graduation" description="Total graduation cost spread over duration">
        <NumberField
          label="Total Cost"
          value={data.graduation.currentTotalCost}
          onChange={(v) => update("graduation", "currentTotalCost", v)}
          suffix="₹"
        />
        <NumberField
          label="Graduation Inflation"
          value={data.graduation.inflationPercent}
          onChange={(v) => update("graduation", "inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Duration"
          value={data.graduation.durationYears}
          onChange={(v) => update("graduation", "durationYears", v)}
          suffix="years"
        />
      </SectionCard>

      <SectionCard title="Education — Post Graduation" description="Total PG cost spread over duration">
        <NumberField
          label="Total Cost"
          value={data.postGraduation.currentTotalCost}
          onChange={(v) => update("postGraduation", "currentTotalCost", v)}
          suffix="₹"
        />
        <NumberField
          label="PG Inflation"
          value={data.postGraduation.inflationPercent}
          onChange={(v) => update("postGraduation", "inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Duration"
          value={data.postGraduation.durationYears}
          onChange={(v) => update("postGraduation", "durationYears", v)}
          suffix="years"
        />
      </SectionCard>
    </>
  )
}
