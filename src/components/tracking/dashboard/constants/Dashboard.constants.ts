import type { GoalStatus, SipStatus, FireTargetType } from "@/types/dashboard"
import type { BadgeVariant } from "../types/Dashboard.components.types"

// ── GoalCard status → badge variant maps ──────────────────
export const GOAL_BADGE_VARIANT: Record<GoalStatus, BadgeVariant> = {
  "on-track": "green-dark",
  monitor: "amber-dark",
  behind: "red-dark",
}

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  "on-track": "On Track",
  monitor: "Monitor",
  behind: "Behind",
}

export const GOAL_PROGRESS_BAR: Record<GoalStatus, string> = {
  "on-track": "wt-progress-fill-green",
  monitor: "wt-progress-fill-amber",
  behind: "wt-progress-fill-red",
}

// ── SipRow status → badge variant maps ──────────────────────
export const SIP_BADGE_VARIANT: Record<SipStatus, BadgeVariant> = {
  processed: "green-dark",
  closed: "red-dark",
  pending: "amber-dark",
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
