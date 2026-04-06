import type { GoalStatus, SipStatus, FireTargetType } from "@/types/dashboard"

// ── GoalCard status style maps ──────────────────────────────
export const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  "on-track": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  monitor: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  behind: "bg-red-500/15 text-red-400 border-red-500/20",
}

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  "on-track": "On Track",
  monitor: "Monitor",
  behind: "Behind",
}

export const GOAL_PROGRESS_BAR: Record<GoalStatus, string> = {
  "on-track": "bg-emerald-500",
  monitor: "bg-amber-500",
  behind: "bg-red-500",
}

// ── SipRow status style maps ────────────────────────────────
export const SIP_STATUS_STYLES: Record<SipStatus, string> = {
  processed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  closed: "bg-red-500/15 text-red-400 border-red-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
}

export const SIP_STATUS_LABEL: Record<SipStatus, string> = {
  processed: "Processed",
  closed: "Closed",
  pending: "Pending",
}

// ── FireCorpusTile target options ───────────────────────────
export const FIRE_TARGET_OPTIONS: { value: FireTargetType; label: string }[] = [
  { value: "finite", label: "Finite Target" },
  { value: "perpetual", label: "Perpetual Target" },
  { value: "suggested", label: "Suggested Target" },
]

// ── DashboardNav tabs ───────────────────────────────────────
export const DASHBOARD_NAV_TABS = ["Dashboard", "Goals", "Transactions", "LTCG Harvest"] as const
