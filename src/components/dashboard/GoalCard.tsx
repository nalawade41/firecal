import type { GoalCardProps } from "./types/Dashboard.components.types"
import { GOAL_STATUS_STYLES, GOAL_STATUS_LABEL, GOAL_PROGRESS_BAR } from "./constants/Dashboard.constants"

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <div
      className="rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/10 p-4 cursor-pointer hover:bg-white/[0.1] transition-colors"
      style={{ borderTopColor: goal.borderColor, borderTopWidth: 3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-sm"
            style={{ background: goal.iconBg }}
          >
            {goal.icon}
          </div>
          <span className="text-[13px] font-medium text-white/90">{goal.name}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${GOAL_STATUS_STYLES[goal.status]}`}>
          {GOAL_STATUS_LABEL[goal.status]}
        </span>
      </div>
      {/* Target */}
      <p className="text-[11px] text-white/35 mb-1.5">{goal.targetLabel}</p>
      {/* Current value */}
      <p className="text-[19px] font-medium text-white/90 mb-1.5">{goal.currentValue}</p>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 mb-2">
        <div
          className={`h-full rounded-full ${GOAL_PROGRESS_BAR[goal.status]} transition-all`}
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-white/35">
        <span>{goal.progressPercent}%</span>
        <span>{goal.gap}</span>
      </div>
    </div>
  )
}
