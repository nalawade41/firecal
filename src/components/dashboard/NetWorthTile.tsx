import { RefreshCw } from "lucide-react"

interface NetWorthTileProps {
  nw: {
    total: string
    calculatedAt: string
    missingNavCount: number
    breakdown: { label: string; value: string }[]
  }
  onRefresh: () => void
  isRefreshing: boolean
}

export function NetWorthTile({ nw, onRefresh, isRefreshing }: NetWorthTileProps) {
  const date = new Date(nw.calculatedAt)
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/10 p-6">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">Total net worth</p>
      <p className="text-4xl font-medium text-emerald-400 leading-none mb-4">{nw.total}</p>

      {/* Calculation metadata with refresh - prominent */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs font-medium text-emerald-300">Calculated on {formattedDate}</span>
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

      <div className="border-t border-white/10 mt-4 pt-4 grid grid-cols-4 gap-2">
        {nw.breakdown.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] text-white/40">{item.label}</p>
            <p className="text-[13px] font-medium text-white/90 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
