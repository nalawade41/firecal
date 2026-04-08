import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { OnboardingData } from "@/types/onboarding"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "₹0"
  if (value === 0) return "₹0"
  if (Math.abs(value) >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`
  if (Math.abs(value) >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function formatINROrDash(value: number): string {
  if (value === 0) return "—"
  return formatINR(value)
}

export function formatUnits(units: number): string {
  if (units === 0) return "0"
  if (units < 0.01) return units.toExponential(2)
  return units.toFixed(3)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ── Goal option helpers for Lumpsum / SIP dropdowns ──────
export interface GoalOption {
  value: string
  label: string
  group: string
}

const GOAL_ICONS: Record<string, string> = {
  fire: "🔥", "school-fees": "🏫", graduation: "🎓",
  marriage: "💍", "house-down-payment": "🏡", whitegoods: "🛒", custom: "✦",
}

export function buildGoalOptions(data: OnboardingData): GoalOption[] {
  const opts: GoalOption[] = []

  if (data.selectedGoals.includes("fire")) {
    opts.push({ value: "fire", label: `${GOAL_ICONS.fire} FIRE`, group: "FIRE" })
  }

  if (data.selectedGoals.includes("school-fees") && data.goalDetails.schoolFees) {
    for (const child of data.goalDetails.schoolFees) {
      const sub = child.label || "Child"
      opts.push({ value: `school-fees::${sub}`, label: `${GOAL_ICONS["school-fees"]} ${sub}`, group: "School Fees" })
    }
  }

  if (data.selectedGoals.includes("graduation") && data.goalDetails.graduation) {
    for (const entry of data.goalDetails.graduation) {
      const sub = entry.label || "Graduation"
      opts.push({ value: `graduation::${sub}`, label: `${GOAL_ICONS.graduation} ${sub}`, group: "Graduation" })
    }
  }

  if (data.selectedGoals.includes("marriage") && data.goalDetails.marriage) {
    for (const entry of data.goalDetails.marriage) {
      const sub = entry.label || "Marriage"
      opts.push({ value: `marriage::${sub}`, label: `${GOAL_ICONS.marriage} ${sub}`, group: "Marriage" })
    }
  }

  if (data.selectedGoals.includes("house-down-payment")) {
    opts.push({ value: "house-down-payment", label: `${GOAL_ICONS["house-down-payment"]} House Down Payment`, group: "House" })
  }

  if (data.selectedGoals.includes("whitegoods") && data.goalDetails.whitegoods) {
    for (const item of data.goalDetails.whitegoods) {
      const sub = item.itemName || "Item"
      opts.push({ value: `whitegoods::${sub}`, label: `${GOAL_ICONS.whitegoods} ${sub}`, group: "Whitegoods" })
    }
  }

  if (data.selectedGoals.includes("custom") && data.customGoalDefinitions) {
    for (const def of data.customGoalDefinitions) {
      opts.push({ value: `custom::${def.id}`, label: `${def.icon || GOAL_ICONS.custom} ${def.name}`, group: "Custom" })
    }
  }

  return opts
}
