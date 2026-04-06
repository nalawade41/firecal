import type { FireProgressBarProps } from "../types/Dashboard.components.types"

export function FireProgressBar({ progressPercent }: FireProgressBarProps) {
  return (
    <div className="h-2 rounded-full bg-white/10 mb-4">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all"
        style={{ width: `${Math.min(progressPercent, 100)}%` }}
      />
    </div>
  )
}
