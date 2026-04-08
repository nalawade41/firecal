import { formatINR, formatUnits, formatDate } from "@/utils"
import { AlertTriangle } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { StatBox } from "@/components/ui/stat-box"
import { StatusBadge } from "@/components/ui/status-badge"
import { AlertPanel } from "@/components/ui/alert-panel"
import { DataTable, DataTableHead, DataTableHeaderRow, DataTableRow, Th, Td } from "@/components/ui/data-table"

import type { AllLotsSectionProps } from "../types/TaxHarvestResults.types"

export function AllLotsSection({ allLots, exitLoadRisk }: AllLotsSectionProps) {
  const activeLots = allLots.filter(l => l.remainingUnits > 0)
  const profitLots = activeLots.filter(l => l.totalUnrealizedGain > 0)
  const lossLots = activeLots.filter(l => l.totalUnrealizedGain < 0)
  const firstLossLot = lossLots.length > 0
    ? lossLots.reduce((earliest, lot) => lot.purchaseDate < earliest.purchaseDate ? lot : earliest, lossLots[0])
    : null

  return (
    <GlassPanel
      title="All Lots (FIFO)"
      description={`${activeLots.length} active lots with ${formatUnits(activeLots.reduce((s, l) => s + l.remainingUnits, 0))} units`}
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBox label="Total Lots" value={String(activeLots.length)} color="blue" />
        <StatBox label="Total Units" value={formatUnits(activeLots.reduce((s, l) => s + l.remainingUnits, 0))} color="blue" />
        <StatBox
          label="Profit Lots"
          value={String(profitLots.length)}
          subtext={formatINR(profitLots.reduce((s, l) => s + l.totalUnrealizedGain, 0))}
          color="green"
        />
        <StatBox
          label="Loss Lots"
          value={String(lossLots.length)}
          subtext={formatINR(lossLots.reduce((s, l) => s + l.totalUnrealizedGain, 0))}
          color="red"
        />
        <StatBox
          label="Loss Trend Since"
          value={firstLossLot ? formatDate(firstLossLot.purchaseDate) : "N/A"}
          subtext={firstLossLot ? `${firstLossLot.holdingPeriodDays} days held` : ""}
          color="amber"
        />
      </div>

      {/* Exit load warning */}
      {exitLoadRisk > 0 && (
        <AlertPanel variant="red" icon={<AlertTriangle className="h-4 w-4" />} title="Exit Load Warning">
          You have {formatINR(exitLoadRisk)} in potential exit load charges if you redeem recently purchased units.
        </AlertPanel>
      )}

      {/* Lots table */}
      <DataTable>
        <DataTableHead>
          <DataTableHeaderRow>
            <Th>Purchase Date</Th>
            <Th align="right">Original Units</Th>
            <Th align="right">Remaining</Th>
            <Th align="right">Buy NAV</Th>
            <Th align="right">Current NAV</Th>
            <Th align="right">Days Held</Th>
            <Th align="center">Type</Th>
            <Th align="right">Unrealized Gain</Th>
          </DataTableHeaderRow>
        </DataTableHead>
        <tbody>
          {activeLots.map((lot, idx) => (
            <DataTableRow key={idx} highlight={lot.isLongTerm ? "green" : "amber"}>
              <Td>{formatDate(lot.purchaseDate)}</Td>
              <Td align="right" mono>{formatUnits(lot.originalUnits)}</Td>
              <Td align="right" mono className="font-medium">{formatUnits(lot.remainingUnits)}</Td>
              <Td align="right" mono>{formatINR(lot.buyNav)}</Td>
              <Td align="right" mono>{formatINR(lot.currentNav)}</Td>
              <Td align="right" mono>{lot.holdingPeriodDays}</Td>
              <Td align="center">
                {lot.isLongTerm ? (
                  <StatusBadge variant="green">LTCG</StatusBadge>
                ) : (
                  <StatusBadge variant="amber">STCG</StatusBadge>
                )}
              </Td>
              <Td align="right" mono className={lot.totalUnrealizedGain >= 0 ? "text-[var(--wt-green)]" : "text-[var(--wt-red)]"}>
                {lot.totalUnrealizedGain >= 0 ? "+" : ""}{formatINR(lot.totalUnrealizedGain)}
              </Td>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </GlassPanel>
  )
}
