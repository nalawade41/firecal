import { GlassPanel } from "@/components/ui/glass-panel"
import type { AssetAllocationTileProps } from "./types/Dashboard.components.types"
import { useDonutChart } from "./hooks/useDonutChart"
import { DonutChart } from "./DonutChart"

export function AssetAllocationTile({ allocation, isLoading }: AssetAllocationTileProps) {
  const { arcs } = useDonutChart(allocation.segments)
  const hasData = allocation.segments.length > 0

  if (isLoading) {
    return (
      <GlassPanel variant="subtle" className="!p-5">
        <p className="wt-label-light mb-4">Asset allocation</p>
        <div className="flex items-center gap-6 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-white/10 shrink-0" />
          <div className="space-y-3 flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 bg-white/10 rounded w-full" />
            ))}
          </div>
        </div>
      </GlassPanel>
    )
  }

  if (!hasData) {
    return (
      <GlassPanel variant="subtle" className="!p-5">
        <p className="wt-label-light mb-4">Asset allocation</p>
        <p className="text-xs text-white/40">No allocation data available</p>
      </GlassPanel>
    )
  }

  const centerLabel = allocation.equityPercent > 0 ? "Equity" : "Portfolio"

  return (
    <GlassPanel variant="subtle" className="!p-5">
      <p className="wt-label-light mb-4">Asset allocation</p>
      <div className="flex items-center gap-6">
        <DonutChart arcs={arcs} centerLabel={centerLabel} centerValue={`${allocation.equityPercent}%`} />
        <div className="space-y-2 flex-1">
          {allocation.segments.map((seg) => (
            <div key={seg.label} className="flex items-center text-xs">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 mr-2" style={{ background: seg.color }} />
              <span className="flex-1 text-white/50">{seg.label}</span>
              <span className="font-medium text-white/80">{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  )
}
