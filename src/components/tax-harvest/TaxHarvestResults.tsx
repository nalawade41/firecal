import type { TaxHarvestResultsProps } from "./types/TaxHarvestResults.types"
import { SummaryCards } from "./sections/SummaryCards"
import { WarningsPanel } from "./sections/WarningsPanel"
import { HarvestPlanSection } from "./sections/HarvestPlanSection"
import { AllLotsSection } from "./sections/AllLotsSection"

export function TaxHarvestResults({ results }: TaxHarvestResultsProps) {
  const { summary, allLots, eligibleLots, harvestPlan } = results

  return (
    <div className="space-y-6">
      <SummaryCards
        totalCurrentValue={summary.totalCurrentValue}
        totalUnits={summary.totalUnits}
        totalLongTermGain={summary.totalLongTermGain}
        eligibleLotsCount={eligibleLots.length}
        stcgExposure={summary.stcgExposure}
      />

      {harvestPlan?.warnings && (
        <WarningsPanel warnings={harvestPlan.warnings} />
      )}

      {harvestPlan && (
        <HarvestPlanSection harvestPlan={harvestPlan} />
      )}

      <AllLotsSection allLots={allLots} exitLoadRisk={summary.exitLoadRisk} />
    </div>
  )
}
