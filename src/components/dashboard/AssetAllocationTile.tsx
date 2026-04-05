import type { DashboardView } from "@/types/dashboard"
import { DonutChart } from "./DonutChart"

interface AssetAllocationTileProps {
  allocation: DashboardView["allocation"]
}

export function AssetAllocationTile({ allocation }: AssetAllocationTileProps) {
  return (
    <div className="rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-4">Asset allocation</p>
      <div className="flex items-center gap-6">
        <DonutChart segments={allocation.segments} centerLabel="Equity" centerValue={`${allocation.equityPercent}%`} />
        <div className="space-y-2 flex-1">
          {allocation.segments.map((seg) => (
            <div key={seg.label} className="flex items-center text-xs">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 mr-2" style={{ background: seg.color }} />
              <span className="flex-1 text-white/50">{seg.label}</span>
              <span className="font-semibold text-white/80">{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
