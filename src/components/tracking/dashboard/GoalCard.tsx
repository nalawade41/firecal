import { StatusBadge } from "@/components/ui/status-badge"
import type { GoalCardProps } from "./types/Dashboard.components.types"
import { GOAL_BADGE_VARIANT, GOAL_STATUS_LABEL, GOAL_PROGRESS_BAR } from "./constants/Dashboard.constants"

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <div
      className="rounded-[var(--wt-r-lg)] bg-white/[0.07] backdrop-blur-sm border border-white/10 p-4 cursor-pointer hover:bg-white/[0.1] transition-colors"
      style={{ borderTopColor: goal.borderColor, borderTopWidth: 3 }}
    >
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
        <StatusBadge variant={GOAL_BADGE_VARIANT[goal.status]}>
          {GOAL_STATUS_LABEL[goal.status]}
        </StatusBadge>
      </div>
      <p className="text-[11px] text-white/35 mb-1.5">{goal.targetLabel}</p>
      <p className="text-[19px] font-medium text-white/90 mb-1.5 font-['DM_Mono',monospace]">{goal.currentValue}</p>
      <div className="wt-progress-track mb-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div
          className={`wt-progress-fill ${GOAL_PROGRESS_BAR[goal.status]}`}
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-white/35">
        <span>{goal.progressPercent}%</span>
        <span>{goal.gap}</span>
      </div>
    </div>
  )
}
