import type { GoalCardView, GoalStatus } from "@/types/dashboard"

const STATUS_STYLES: Record<GoalStatus, string> = {
  "on-track": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  monitor: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  behind: "bg-red-500/15 text-red-400 border-red-500/20",
}
const STATUS_LABEL: Record<GoalStatus, string> = {
  "on-track": "On Track",
  monitor: "Monitor",
  behind: "Behind",
}
const PROGRESS_BAR: Record<GoalStatus, string> = {
  "on-track": "bg-emerald-500",
  monitor: "bg-amber-500",
  behind: "bg-red-500",
}

interface GoalCardProps {
  goal: GoalCardView
}

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
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[goal.status]}`}>
          {STATUS_LABEL[goal.status]}
        </span>
      </div>
      {/* Target */}
      <p className="text-[11px] text-white/35 mb-1.5">{goal.targetLabel}</p>
      {/* Current value */}
      <p className="text-[19px] font-medium text-white/90 mb-1.5">{goal.currentValue}</p>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/10 mb-2">
        <div
          className={`h-full rounded-full ${PROGRESS_BAR[goal.status]} transition-all`}
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
