import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { HealthcareSectionProps } from "../types/InputForm.types"

export function HealthcareSection({ data, update }: HealthcareSectionProps) {
  return (
    <SectionCard title="Healthcare" description="Medical and insurance expenses">
      <NumberField
        label="Annual Medical Expense"
        value={data.currentAnnualMedicalExpense}
        onChange={(v) => update("currentAnnualMedicalExpense", v)}
        suffix="₹"
      />
      <NumberField
        label="Medical Inflation"
        value={data.medicalInflationPercent}
        onChange={(v) => update("medicalInflationPercent", v)}
        suffix="%"
        step={0.5}
      />
      <NumberField
        label="Insurance Premium"
        value={data.currentInsurancePremium}
        onChange={(v) => update("currentInsurancePremium", v)}
        suffix="₹"
      />
      <NumberField
        label="Premium Inflation"
        value={data.insurancePremiumInflationPercent}
        onChange={(v) => update("insurancePremiumInflationPercent", v)}
        suffix="%"
        step={0.5}
      />
    </SectionCard>
  )
}
