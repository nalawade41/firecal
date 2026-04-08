import { RefreshCw } from "lucide-react"
import { GlassPanel } from "@/components/ui/glass-panel"
import { StatusBadge } from "@/components/ui/status-badge"
import type { NetWorthTileProps } from "./types/Dashboard.components.types"

export function NetWorthTile({ nw, onRefresh, isRefreshing }: NetWorthTileProps) {
  const date = new Date(nw.calculatedAt)
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <GlassPanel variant="subtle">
      <p className="wt-label-light mb-2">Total net worth</p>
      <p className="text-4xl font-medium text-emerald-400 leading-none mb-4 font-['DM_Mono',monospace]">{nw.total}</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <StatusBadge variant="green-dark">
            <span className="text-xs">Calculated on {formattedDate}</span>
          </StatusBadge>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        {nw.missingNavCount > 0 && (
          <span className="text-xs font-medium text-amber-400">
            {nw.missingNavCount} price{nw.missingNavCount > 1 ? "s" : ""} missing
          </span>
        )}
      </div>

      <div className="border-t border-white/10 mt-4 pt-4 grid grid-cols-4 gap-6">
        {nw.breakdown.map((item) => (
          <div key={item.label}>
            <p className="wt-label-light">{item.label}</p>
            <p className="text-[13px] font-medium text-white/90 mt-1 font-['DM_Mono',monospace]">{item.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
