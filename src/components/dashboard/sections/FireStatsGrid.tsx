import { Info } from "lucide-react"
import type { FireStatsGridProps } from "../types/Dashboard.components.types"

export function FireStatsGrid({ fire, showTooltip, onTooltipEnter, onTooltipLeave }: FireStatsGridProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Progress</p>
        <p className="text-[13px] font-medium text-white">{fire.progressPercent}%</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Gap</p>
        <p className="text-[13px] font-medium text-white">{fire.gap}</p>
      </div>
      <div>
        <div className="flex items-center gap-1 mb-1">
          <p className="text-[10px] uppercase tracking-wider text-white/35">Rate</p>
          <div
            className="relative"
            onMouseEnter={onTooltipEnter}
            onMouseLeave={onTooltipLeave}
          >
            <Info className="h-3 w-3 text-white/40 cursor-help" />
            {showTooltip && (
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded-lg bg-slate-800 text-xs text-white/80 shadow-lg border border-white/10 z-10">
                CAGR needed for your current SIP + current value to grow to target
              </div>
            )}
          </div>
        </div>
        <p className="text-[13px] font-medium text-white">{fire.reqCagr}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Target SIP</p>
        <p className="text-[13px] font-medium text-emerald-300">{fire.targetSip}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Invest Now</p>
        <p className="text-[13px] font-medium text-emerald-300">{fire.lumpsumNeeded}</p>
      </div>
    </div>
  )
}
