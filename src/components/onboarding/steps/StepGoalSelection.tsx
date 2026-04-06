import { Flame, GraduationCap, School, Heart, Home, Package, Star, X, Plus } from "lucide-react"
import type { StepProps } from "@/types/onboarding"
import { PRESET_GOALS, ICON_OPTIONS, MAX_CUSTOM_GOALS } from "./constants/Steps.constants"
import { useStepGoalSelection } from "./hooks/useStepGoalSelection"

function GoalIcon({ icon, className }: { icon: string; className?: string }) {
  const props = { className: className ?? "h-6 w-6" }
  switch (icon) {
    case "flame": return <Flame {...props} />
    case "school": return <School {...props} />
    case "graduation-cap": return <GraduationCap {...props} />
    case "heart": return <Heart {...props} />
    case "home": return <Home {...props} />
    case "package": return <Package {...props} />
    case "star": return <Star {...props} />
    default: return <Star {...props} />
  }
}

export function StepGoalSelection(props: StepProps) {
  const { data } = props
  const {
    showCustomPopup, setShowCustomPopup,
    customName, setCustomName,
    customIcon, setCustomIcon,
    toggleGoal, toggleCustomGoal, handleAddCustomGoal,
    isSelected, canAddCustom,
  } = useStepGoalSelection(props)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Preset goals */}
        {PRESET_GOALS.map((goal) => (
          <button
            key={goal.type}
            type="button"
            onClick={() => toggleGoal(goal.type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
              isSelected(goal.type)
                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <GoalIcon
              icon={goal.icon}
              className={`h-7 w-7 ${isSelected(goal.type) ? "text-emerald-600" : "text-slate-500"}`}
            />
            <span className={`text-sm font-medium ${isSelected(goal.type) ? "text-emerald-800" : "text-slate-700"}`}>
              {goal.label}
            </span>
          </button>
        ))}

        {/* Custom goals as tiles in the grid */}
        {data.customGoalDefinitions.map((def) => (
          <div key={def.id} className="relative">
            <button
              type="button"
              onClick={() => toggleCustomGoal(def.id)}
              className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 shadow-sm transition-all duration-150"
            >
              <GoalIcon icon={def.icon} className="h-7 w-7 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">{def.name}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleCustomGoal(def.id)}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add custom goal button */}
        {canAddCustom && (
          <button
            type="button"
            onClick={() => setShowCustomPopup(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-all duration-150"
          >
            <Plus className="h-7 w-7 text-slate-400" />
            <span className="text-sm font-medium text-slate-500">+ Custom</span>
          </button>
        )}
      </div>

      {!canAddCustom && (
        <p className="text-xs text-slate-500 text-center">Maximum {MAX_CUSTOM_GOALS} custom goals reached.</p>
      )}

      {/* Custom goal popup/modal */}
      {showCustomPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900">Add Custom Goal</h4>
              <button type="button" onClick={() => setShowCustomPopup(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Goal Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Vacation Fund"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Choose Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.icon}
                    type="button"
                    onClick={() => setCustomIcon(opt.icon)}
                    className={`p-2.5 rounded-lg border-2 transition-all ${
                      customIcon === opt.icon
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <GoalIcon icon={opt.icon} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomPopup(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomGoal}
                disabled={!customName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
