import type { CorpusHeaderProps } from "../types/Dashboard.components.types"

export function CorpusHeader({ fire }: CorpusHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-1">Fire corpus</p>
        <p className="text-[30px] font-medium text-white leading-none">
          {fire.currentCorpus}{" "}
          <span className="text-[15px] text-white/40">/ {fire.targetCorpus}</span>
        </p>
      </div>
      <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/60">
        Age {fire.currentAge} → {fire.targetAge}
      </span>
    </div>
  )
}
