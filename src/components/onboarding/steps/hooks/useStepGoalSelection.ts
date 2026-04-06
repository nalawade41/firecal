import { useState } from "react"
import type { StepProps, GoalType, CustomGoalDefinition } from "@/types/onboarding"
import { MAX_CUSTOM_GOALS } from "../constants/Steps.constants"
import type { UseStepGoalSelectionReturn } from "../types/Steps.types"

export function useStepGoalSelection({ data, updateData }: StepProps): UseStepGoalSelectionReturn {
  const [showCustomPopup, setShowCustomPopup] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customIcon, setCustomIcon] = useState("star")

  function toggleGoal(type: GoalType) {
    const current = data.selectedGoals
    const updated = current.includes(type)
      ? current.filter((g) => g !== type)
      : [...current, type]
    updateData({ selectedGoals: updated })
  }

  function toggleCustomGoal(id: string) {
    const def = data.customGoalDefinitions.find((d) => d.id === id)
    if (!def) return
    const updatedDefs = data.customGoalDefinitions.filter((d) => d.id !== id)
    const hasCustom = updatedDefs.length > 0
    updateData({
      customGoalDefinitions: updatedDefs,
      selectedGoals: hasCustom
        ? data.selectedGoals
        : data.selectedGoals.filter((g) => g !== "custom"),
    })
  }

  function handleAddCustomGoal() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    const newDef: CustomGoalDefinition = { id, name: customName.trim(), icon: customIcon }
    const alreadyHasCustom = data.selectedGoals.includes("custom")
    updateData({
      selectedGoals: alreadyHasCustom ? data.selectedGoals : [...data.selectedGoals, "custom"],
      customGoalDefinitions: [...data.customGoalDefinitions, newDef],
    })
    setCustomName("")
    setCustomIcon("star")
    setShowCustomPopup(false)
  }

  const isSelected = (type: GoalType) => data.selectedGoals.includes(type)
  const canAddCustom = data.customGoalDefinitions.length < MAX_CUSTOM_GOALS

  return {
    showCustomPopup, setShowCustomPopup,
    customName, setCustomName,
    customIcon, setCustomIcon,
    toggleGoal, toggleCustomGoal, handleAddCustomGoal,
    isSelected, canAddCustom,
  }
}
