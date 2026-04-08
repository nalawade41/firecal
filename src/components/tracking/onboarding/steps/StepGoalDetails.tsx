import { Info, ChevronRight } from "lucide-react"
import type { StepProps } from "@/types/onboarding"
import {
  GOAL_TAB_CONFIG,
  FireTab,
  SchoolFeesTab,
  GraduationTab,
  MarriageTab,
  HouseTab,
  WhitegoodsTab,
  CustomTab,
} from "./goal-tabs"
import { useStepGoalDetails } from "./hooks/useStepGoalDetails"

export function StepGoalDetails(props: StepProps) {
  const { data, updateData } = props
  const {
    activeGoals, resolvedTab, setActiveTab,
    updateGoalDetails, isEmpty, currentIdx, tabConfig,
  } = useStepGoalDetails(props)

  if (isEmpty) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Info className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="font-medium">No goals selected.</p>
        <p className="text-sm">Go back and select at least one goal to configure.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {activeGoals.map((goal, idx) => {
          const cfg = GOAL_TAB_CONFIG[goal] ?? { emoji: "✦", label: goal }
          const isActive = resolvedTab === goal
          return (
            <button
              key={goal}
              type="button"
              onClick={() => setActiveTab(goal)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-[var(--wt-divider)] bg-white text-[var(--wt-ink2)] hover:border-[var(--wt-sage)] hover:bg-[var(--wt-foam)]"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <span className={`ml-1 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                isActive ? "bg-[var(--wt-green-light)] text-[var(--wt-green)]" : "bg-[var(--wt-mist)] text-[var(--wt-ink3)]"
              }`}>
                {idx + 1}/{activeGoals.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 px-1">
        <span className="text-lg">{tabConfig?.emoji}</span>
        <h4 className="text-base font-bold text-slate-800">{tabConfig?.label} Details</h4>
        {activeGoals.length > 1 && (
          <span className="ml-auto text-xs text-slate-500">
            Goal {currentIdx + 1} of {activeGoals.length}
            {currentIdx < activeGoals.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeGoals[currentIdx + 1])}
                className="ml-2 inline-flex items-center gap-0.5 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Next goal <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </span>
        )}
      </div>

      <div className="min-h-[200px]">
        {resolvedTab === "fire" && <FireTab data={data} updateGoalDetails={updateGoalDetails} updateData={updateData} />}
        {resolvedTab === "school-fees" && <SchoolFeesTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "graduation" && <GraduationTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "marriage" && <MarriageTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "house-down-payment" && <HouseTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "whitegoods" && <WhitegoodsTab data={data} updateGoalDetails={updateGoalDetails} />}
        {resolvedTab === "custom" && <CustomTab data={data} updateGoalDetails={updateGoalDetails} />}
      </div>
    </div>
  )
}
