import { useState } from "react"
import { Info } from "lucide-react"
import type { FireTargetType } from "@/engine/tracking/fire-calculation"

interface FireCorpusTileProps {
  fire: {
    currentCorpus: string
    targetCorpus: string
    currentAge: number
    targetAge: number
    progressPercent: number
    gap: string
    reqCagr: string
    targetSip: string
    lumpsumNeeded: string
    targetType: FireTargetType
    onTargetChange: (type: FireTargetType) => void
  }
}

export function FireCorpusTile({ fire }: FireCorpusTileProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const targetOptions: { value: FireTargetType; label: string }[] = [
    { value: "finite", label: "Finite Target" },
    { value: "perpetual", label: "Perpetual Target" },
    { value: "suggested", label: "Suggested Target" },
  ]

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#1B3A28] to-[#14291C] border border-emerald-800/30 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(45,138,80,0.15),transparent_60%)] pointer-events-none" />
      <div className="relative">
        {/* Target Type Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {targetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => fire.onTargetChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                fire.targetType === option.value
                  ? "bg-emerald-500 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

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
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-white/10 mb-4">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(fire.progressPercent, 100)}%` }}
          />
        </div>
        {/* Stats */}
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
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
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
      </div>
    </div>
  )
}
