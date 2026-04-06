import type { TaxHarvestResults } from "@/types/tax-harvest"
import { formatINR, formatUnits, formatDate } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface TaxHarvestResultsViewProps {
  results: TaxHarvestResults
}

export function TaxHarvestResultsView({ results }: TaxHarvestResultsViewProps) {
  const { summary, allLots, eligibleLots, harvestPlan } = results
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Portfolio"
          value={formatINR(summary.totalCurrentValue)}
          subtext={`${formatUnits(summary.totalUnits)} units`}
          color="blue"
        />
        <SummaryCard
          title="Unrealized LTCG"
          value={formatINR(summary.totalLongTermGain)}
          subtext={`${eligibleLots.length} eligible lots`}
          color="green"
        />
        <SummaryCard
          title="STCG Exposure"
          value={formatINR(summary.stcgExposure)}
          subtext="Short-term risk"
          color={summary.stcgExposure > 0 ? "amber" : "green"}
        />
      </div>

      {/* Warnings */}
      {harvestPlan?.warnings && harvestPlan.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <h4 className="font-semibold">Warnings</h4>
          </div>
          <ul className="text-sm text-amber-700 space-y-1">
            {harvestPlan.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Harvest Plan */}
      {harvestPlan && harvestPlan.lots.length > 0 && (
        <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Harvest Plan</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Available headroom: {formatINR(harvestPlan.remainingHeadroom + harvestPlan.totalHarvestableGain)} | Can harvest: {formatINR(harvestPlan.totalHarvestableGain)}
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-emerald-50/50 border border-emerald-200">
              <div>
                <p className="text-xs text-emerald-600">Total Units to Redeem</p>
                <p className="text-lg font-semibold text-emerald-700">{formatUnits(harvestPlan.totalUnitsToRedeem)}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Redemption Value</p>
                <p className="text-lg font-semibold text-emerald-700">{formatINR(harvestPlan.totalRedemptionValue)}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Harvestable Gain</p>
                <p className="text-lg font-semibold text-emerald-700">{formatINR(harvestPlan.totalHarvestableGain)}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Remaining Headroom</p>
                <p className="text-lg font-semibold text-emerald-700">{formatINR(harvestPlan.remainingHeadroom)}</p>
              </div>
            </div>

            {harvestPlan.partialLot && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <h5 className="font-medium text-amber-800 mb-2">Partial Redemption Instructions</h5>
                <p className="text-sm text-amber-700">
                  Redeem exactly <strong>{formatUnits(harvestPlan.partialLot.redeemableUnits)}</strong> units from the lot purchased on{" "}
                  <strong>{formatDate(harvestPlan.partialLot.lot.purchaseDate)}</strong> to harvest{" "}
                  <strong>{formatINR(harvestPlan.partialLot.harvestableGain)}</strong> in gains without crossing the exemption limit.
                </p>
              </div>
            )}

            {/* Harvestable Lots Table */}
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Purchase Date</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Units</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Buy NAV</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Gain/Unit</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total Gain</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Cumulative</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvestPlan.lots.map((hLot, idx) => {
                      const cumulativeGain = harvestPlan.lots
                        .slice(0, idx + 1)
                        .reduce((sum, lot) => sum + lot.harvestableGain, 0)
                      return (
                      <tr
                        key={idx}
                        className={`border-b border-slate-100 ${hLot.isPartial ? "bg-amber-50/50" : "bg-emerald-50/30"}`}
                      >
                        <td className="py-2 px-3">{formatDate(hLot.lot.purchaseDate)}</td>
                        <td className="py-2 px-3 text-right">
                          {formatUnits(hLot.redeemableUnits)}
                          {hLot.isPartial && (
                            <span className="text-xs text-amber-600 ml-1">
                              (of {formatUnits(hLot.lot.remainingUnits)})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">{formatINR(hLot.lot.buyNav)}</td>
                        <td className="py-2 px-3 text-right text-emerald-600">+{formatINR(hLot.lot.gainPerUnit)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatINR(hLot.harvestableGain)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-700">{formatINR(cumulativeGain)}</td>
                        <td className="py-2 px-3 text-center">
                          {hLot.isPartial ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                              <Info className="h-3 w-3" />
                              Partial
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Full
                            </span>
                          )}
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Lots */}
      <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">All Lots (FIFO)</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allLots.filter(l => l.remainingUnits > 0).length} active lots with {formatUnits(allLots.filter(l => l.remainingUnits > 0).reduce((s, l) => s + l.remainingUnits, 0))} units
          </p>
        </div>

        {/* All Lots Summary Stats */}
        {(() => {
          const activeLots = allLots.filter(l => l.remainingUnits > 0)
          const profitLots = activeLots.filter(l => l.totalUnrealizedGain > 0)
          const lossLots = activeLots.filter(l => l.totalUnrealizedGain < 0)
          const firstLossLot = lossLots.length > 0 
            ? lossLots.reduce((earliest, lot) => lot.purchaseDate < earliest.purchaseDate ? lot : earliest, lossLots[0])
            : null
          
          return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
                <p className="text-xs text-blue-600">Total Lots</p>
                <p className="text-lg font-semibold text-blue-700">{activeLots.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
                <p className="text-xs text-blue-600">Total Units</p>
                <p className="text-lg font-semibold text-blue-700">{formatUnits(activeLots.reduce((s, l) => s + l.remainingUnits, 0))}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <p className="text-xs text-emerald-600">Profit Lots</p>
                <p className="text-lg font-semibold text-emerald-700">{profitLots.length}</p>
                <p className="text-xs text-emerald-600">{formatINR(profitLots.reduce((s, l) => s + l.totalUnrealizedGain, 0))}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
                <p className="text-xs text-red-600">Loss Lots</p>
                <p className="text-lg font-semibold text-red-700">{lossLots.length}</p>
                <p className="text-xs text-red-600">{formatINR(lossLots.reduce((s, l) => s + l.totalUnrealizedGain, 0))}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
                <p className="text-xs text-amber-600">Loss Trend Since</p>
                <p className="text-lg font-semibold text-amber-700">
                  {firstLossLot ? formatDate(firstLossLot.purchaseDate) : "N/A"}
                </p>
                <p className="text-xs text-amber-600">
                  {firstLossLot ? `${firstLossLot.holdingPeriodDays} days held` : ""}
                </p>
              </div>
            </div>
          )
        })()}

        {summary.exitLoadRisk > 0 && (
          <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <h4 className="font-medium text-sm">Exit Load Warning</h4>
            </div>
            <p className="text-xs text-red-700 mt-1">
              You have {formatINR(summary.exitLoadRisk)} in potential exit load charges if you redeem recently purchased units.
            </p>
          </div>
        )}

        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Purchase Date</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Original Units</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Remaining</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Buy NAV</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Current NAV</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Days Held</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Unrealized Gain</th>
                </tr>
              </thead>
              <tbody>
                {allLots
                  .filter(lot => lot.remainingUnits > 0)
                  .map((lot, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 ${lot.isLongTerm ? "bg-emerald-50/20" : "bg-amber-50/20"}`}
                    >
                      <td className="py-2 px-3">{formatDate(lot.purchaseDate)}</td>
                      <td className="py-2 px-3 text-right">{formatUnits(lot.originalUnits)}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatUnits(lot.remainingUnits)}</td>
                      <td className="py-2 px-3 text-right">{formatINR(lot.buyNav)}</td>
                      <td className="py-2 px-3 text-right">{formatINR(lot.currentNav)}</td>
                      <td className="py-2 px-3 text-right">{lot.holdingPeriodDays}</td>
                      <td className="py-2 px-3 text-center">
                        {lot.isLongTerm ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">LTCG</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">STCG</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={lot.totalUnrealizedGain >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {lot.totalUnrealizedGain >= 0 ? "+" : ""}
                          {formatINR(lot.totalUnrealizedGain)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtext,
  color,
}: {
  title: string
  value: string
  subtext: string
  color: "blue" | "green" | "amber" | "red"
}) {
  const colorClasses = {
    blue: "bg-blue-50/50 border-blue-200 text-blue-700",
    green: "bg-emerald-50/50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50/50 border-amber-200 text-amber-700",
    red: "bg-red-50/50 border-red-200 text-red-700",
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <p className="text-xs opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-70 mt-1">{subtext}</p>
    </div>
  )
}
