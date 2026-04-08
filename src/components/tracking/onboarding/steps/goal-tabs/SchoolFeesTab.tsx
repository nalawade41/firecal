import { TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertPanel } from "@/components/ui/alert-panel"
import { formatINR } from "@/utils"
import type { TabProps, SchoolFeeChildViewData } from "./types/GoalTabs.types"
import { useSchoolFeesTab } from "./hooks/useSchoolFeesTab"
import type { SchoolFeesChild } from "@/types/onboarding"

export function SchoolFeesTab(props: TabProps) {
  const { childViews, updateChild } = useSchoolFeesTab(props)

  return (
    <div className="space-y-6">
      {childViews.map((cv) => (
        <SchoolFeeChildCard key={cv.index} view={cv} updateChild={updateChild} />
      ))}
    </div>
  )
}

function SchoolFeeChildCard({
  view: v,
  updateChild,
}: {
  view: SchoolFeeChildViewData
  updateChild: (index: number, patch: Partial<SchoolFeesChild>) => void
}) {
  return (
    <GlassPanel variant="light" className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Label / Name</label>
        <input
          type="text"
          value={v.child.label}
          onChange={(e) => updateChild(v.index, { label: e.target.value })}
          placeholder={`e.g., Child ${v.index + 1} School`}
          className="w-full wt-form-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Child Current Age"
          value={v.child.childCurrentAge}
          onChange={(val) => updateChild(v.index, { childCurrentAge: val })}
          min={0}
        />
        <NumberField
          label="School Starting Age"
          value={v.child.schoolStartingAge}
          onChange={(val) => updateChild(v.index, { schoolStartingAge: val })}
          min={3}
        />
        <NumberField
          label="Current Yearly Fee"
          value={v.child.currentSchoolFeeYearly}
          onChange={(val) => updateChild(v.index, { currentSchoolFeeYearly: val })}
          suffix="₹"
        />
        <NumberField
          label="Fee Hike %"
          value={v.child.expectedInflationYearly}
          onChange={(val) => updateChild(v.index, { expectedInflationYearly: val })}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Hike Every N Years"
          value={v.hikeEvery}
          onChange={(val) => updateChild(v.index, { feeHikeEveryNYears: val })}
          min={1}
        />
        <NumberField
          label="Total School Years"
          value={v.totalYears}
          onChange={(val) => updateChild(v.index, { totalSchoolYears: val })}
          min={1}
        />
      </div>

      {/* Expected returns slider */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Expected Returns</label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={6} max={18} step={0.5} value={v.expReturns}
            onChange={(e) => updateChild(v.index, { expectedReturns: Number(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
          />
          <span className="text-sm font-bold text-blue-700 min-w-[48px] text-right">{v.expReturns}%</span>
        </div>
      </div>

      {/* Per-child calculation card */}
      {v.totalLumpsumNeeded > 0 && (
        <AlertPanel
          variant="blue"
          icon={<TrendingUp className="h-4 w-4" />}
          title={`${v.child.label || `Child ${v.index + 1}`} — ${v.totalYears}yr schooling`}
        >
          <div className={`grid ${v.notInSchool ? "grid-cols-4" : "grid-cols-3"} gap-2`}>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Outflow</p>
              <p className="text-sm font-bold mt-0.5">{formatINR(v.totalFeeOutflow)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
              <p className="text-sm font-bold mt-0.5">{formatINR(v.totalLumpsumNeeded)}</p>
            </div>
            {v.notInSchool && (
              <div className="text-center p-2 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                <p className="text-sm font-bold mt-0.5">{formatINR(v.sipNeeded)}</p>
              </div>
            )}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Equity / Debt</p>
              <p className="text-sm font-bold mt-0.5">
                {formatINR(v.lumpsumEquity)} / {formatINR(v.lumpsumDebt)}
              </p>
            </div>
          </div>
          <p className="text-[10px] opacity-70 leading-relaxed mt-2">
            {v.useDualBucket
              ? `Dual-bucket: ${v.equityCount} yr equity, ${v.debtCount} yr debt at ${v.returnPct}% blended return (equity + debt combo). 3-year glide path.`
              : `Pure equity at ${v.returnPct}% CAGR — school starts in ${v.yearsUntilSchoolStarts} yr, enough time for full equity exposure.`}
            {v.notInSchool ? ` SIP over ${v.yearsUntilSchoolStarts} yr to accumulate corpus by school start.` : " Child already in school — corpus needed now."}
          </p>
        </AlertPanel>
      )}
    </GlassPanel>
  )
}
