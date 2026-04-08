import { formatINR, formatUnits } from "@/utils"

import type { SummaryCardsProps } from "../types/TaxHarvestResults.types"
import { SummaryCard } from "./SummaryCard"

export function SummaryCards({
  totalCurrentValue,
  totalUnits,
  totalLongTermGain,
  eligibleLotsCount,
  stcgExposure,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Portfolio"
        value={formatINR(totalCurrentValue)}
        subtext={`${formatUnits(totalUnits)} units`}
        color="blue"
      />
      <SummaryCard
        title="Unrealized LTCG"
        value={formatINR(totalLongTermGain)}
        subtext={`${eligibleLotsCount} eligible lots`}
        color="green"
      />
      <SummaryCard
        title="STCG Exposure"
        value={formatINR(stcgExposure)}
        subtext="Short-term risk"
        color={stcgExposure > 0 ? "amber" : "green"}
      />
    </div>
  )
}
