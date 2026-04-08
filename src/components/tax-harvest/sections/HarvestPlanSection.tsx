import { formatINR, formatUnits, formatDate } from "@/utils"
import { CheckCircle, Info } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { StatBox } from "@/components/ui/stat-box"
import { StatusBadge } from "@/components/ui/status-badge"
import { MoneyValue } from "@/components/ui/money-value"
import { AlertPanel } from "@/components/ui/alert-panel"
import { DataTable, DataTableHead, DataTableHeaderRow, DataTableRow, Th, Td } from "@/components/ui/data-table"

import type { HarvestPlanSectionProps } from "../types/TaxHarvestResults.types"

export function HarvestPlanSection({ harvestPlan }: HarvestPlanSectionProps) {
  if (harvestPlan.lots.length === 0) return null

  return (
    <GlassPanel
      title="Harvest Plan"
      description={`Available headroom: ${formatINR(harvestPlan.remainingHeadroom + harvestPlan.totalHarvestableGain)} | Can harvest: ${formatINR(harvestPlan.totalHarvestableGain)}`}
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total Units to Redeem" value={formatUnits(harvestPlan.totalUnitsToRedeem)} color="green" size="lg" />
        <StatBox label="Redemption Value" value={formatINR(harvestPlan.totalRedemptionValue)} color="green" size="lg" />
        <StatBox label="Harvestable Gain" value={formatINR(harvestPlan.totalHarvestableGain)} color="green" size="lg" />
        <StatBox label="Remaining Headroom" value={formatINR(harvestPlan.remainingHeadroom)} color="green" size="lg" />
      </div>

      {/* Partial redemption callout */}
      {harvestPlan.partialLot && (
        <AlertPanel variant="amber" title="Partial Redemption Instructions">
          Redeem exactly <MoneyValue className="font-medium">{formatUnits(harvestPlan.partialLot.redeemableUnits)}</MoneyValue> units from the lot purchased on{" "}
          <strong>{formatDate(harvestPlan.partialLot.lot.purchaseDate)}</strong> to harvest{" "}
          <MoneyValue className="font-medium">{formatINR(harvestPlan.partialLot.harvestableGain)}</MoneyValue> in gains without crossing the exemption limit.
        </AlertPanel>
      )}

      {/* Lots table */}
      <DataTable>
        <DataTableHead>
          <DataTableHeaderRow>
            <Th>Purchase Date</Th>
            <Th align="right">Units</Th>
            <Th align="right">Buy NAV</Th>
            <Th align="right">Gain/Unit</Th>
            <Th align="right">Total Gain</Th>
            <Th align="right">Cumulative</Th>
            <Th align="center">Type</Th>
          </DataTableHeaderRow>
        </DataTableHead>
        <tbody>
          {harvestPlan.lots.map((hLot, idx) => {
            const cumulativeGain = harvestPlan.lots
              .slice(0, idx + 1)
              .reduce((sum, lot) => sum + lot.harvestableGain, 0)
            return (
              <DataTableRow key={idx} highlight={hLot.isPartial ? "amber" : "green"}>
                <Td>{formatDate(hLot.lot.purchaseDate)}</Td>
                <Td align="right" mono>
                  {formatUnits(hLot.redeemableUnits)}
                  {hLot.isPartial && (
                    <span className="text-xs text-[var(--wt-amber)] ml-1">
                      (of {formatUnits(hLot.lot.remainingUnits)})
                    </span>
                  )}
                </Td>
                <Td align="right" mono>{formatINR(hLot.lot.buyNav)}</Td>
                <Td align="right" mono className="text-[var(--wt-green)]">+{formatINR(hLot.lot.gainPerUnit)}</Td>
                <Td align="right" mono className="font-medium">{formatINR(hLot.harvestableGain)}</Td>
                <Td align="right" mono className="font-medium text-[var(--wt-green)]">{formatINR(cumulativeGain)}</Td>
                <Td align="center">
                  {hLot.isPartial ? (
                    <StatusBadge variant="amber" icon={<Info className="h-3 w-3" />}>Partial</StatusBadge>
                  ) : (
                    <StatusBadge variant="green" icon={<CheckCircle className="h-3 w-3" />}>Full</StatusBadge>
                  )}
                </Td>
              </DataTableRow>
            )
          })}
        </tbody>
      </DataTable>
    </GlassPanel>
  )
}
