import { useState } from "react"
import type { StepProps, GoalType, GoalDetails } from "@/types/onboarding"
import { GOAL_TAB_CONFIG } from "../goal-tabs/constants/GoalTabs.constants"
import type { UseStepGoalDetailsReturn } from "../types/Steps.types"

export function useStepGoalDetails({ data, updateData }: StepProps): UseStepGoalDetailsReturn {
  const activeGoals = data.selectedGoals.filter((g, i, arr) => arr.indexOf(g) === i) as GoalType[]
  const [activeTab, setActiveTab] = useState<string>(activeGoals[0] ?? "fire")

  const resolvedTab = activeGoals.includes(activeTab as GoalType) ? activeTab : activeGoals[0] ?? "fire"

  function updateGoalDetails(updates: Partial<GoalDetails>) {
    updateData({ goalDetails: { ...data.goalDetails, ...updates } })
  }

  const isEmpty = activeGoals.length === 0
  const currentIdx = activeGoals.indexOf(resolvedTab as GoalType)
  const tabConfig = GOAL_TAB_CONFIG[resolvedTab]

  return { activeGoals, resolvedTab, setActiveTab, updateGoalDetails, isEmpty, currentIdx, tabConfig }
}
