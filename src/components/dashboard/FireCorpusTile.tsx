import type { FireCorpusTileProps } from "./types/Dashboard.components.types"
import { TargetChips } from "./sections/TargetChips"
import { CorpusHeader } from "./sections/CorpusHeader"
import { FireProgressBar } from "./sections/FireProgressBar"
import { FireStatsGrid } from "./sections/FireStatsGrid"

export function FireCorpusTile({ fire, showTooltip, onTooltipEnter, onTooltipLeave }: FireCorpusTileProps) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-[#1B3A28] to-[#14291C] border border-emerald-800/30 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(45,138,80,0.15),transparent_60%)] pointer-events-none" />
      <div className="relative">
        <TargetChips fire={fire} />
        <CorpusHeader fire={fire} />
        <FireProgressBar progressPercent={fire.progressPercent} />
        <FireStatsGrid
          fire={fire}
          showTooltip={showTooltip}
          onTooltipEnter={onTooltipEnter}
          onTooltipLeave={onTooltipLeave}
        />
      </div>
    </div>
  )
}
