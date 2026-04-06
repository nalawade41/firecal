import type { TargetChipsProps } from "../types/Dashboard.components.types"
import { FIRE_TARGET_OPTIONS } from "../constants/Dashboard.constants"

export function TargetChips({ fire }: TargetChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {FIRE_TARGET_OPTIONS.map((option) => (
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
  )
}
