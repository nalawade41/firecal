import type { HealthcareParameters, TimelineYear, YearlyHealthcareResult } from "@/types"

export function computeHealthcareForYear(
  timeline: TimelineYear,
  params: HealthcareParameters
): YearlyHealthcareResult {
  const { yearIndex } = timeline

  const medicalCost =
    params.currentAnnualMedicalExpense *
    Math.pow(1 + params.medicalInflationPercent / 100, yearIndex)

  const insuranceCost =
    params.currentInsurancePremium *
    Math.pow(1 + params.insurancePremiumInflationPercent / 100, yearIndex)

  return {
    medicalCost,
    insuranceCost,
    totalHealthcareCost: medicalCost + insuranceCost,
  }
}
