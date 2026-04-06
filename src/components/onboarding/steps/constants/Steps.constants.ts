import type { GoalType } from "@/types/onboarding"

export const MAX_CUSTOM_GOALS = 5

export const PRESET_GOALS: { type: GoalType; label: string; icon: string }[] = [
  { type: "fire", label: "FIRE", icon: "flame" },
  { type: "school-fees", label: "School Fees", icon: "school" },
  { type: "graduation", label: "Graduation", icon: "graduation-cap" },
  { type: "marriage", label: "Marriage", icon: "heart" },
  { type: "house-down-payment", label: "House / Down Payment", icon: "home" },
  { type: "whitegoods", label: "Whitegoods", icon: "package" },
]

export const ICON_OPTIONS = [
  { name: "Star", icon: "star" },
  { name: "Heart", icon: "heart" },
  { name: "Home", icon: "home" },
  { name: "Flame", icon: "flame" },
  { name: "Package", icon: "package" },
  { name: "School", icon: "school" },
  { name: "Graduation Cap", icon: "graduation-cap" },
]

export const GOAL_NAME_MAP: Record<string, string> = {
  fire: "FIRE",
  "school-fees": "School Fees",
  graduation: "Graduation",
  marriage: "Marriage",
  "house-down-payment": "House / Down Payment",
  whitegoods: "Whitegoods",
}
