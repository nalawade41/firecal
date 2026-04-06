import { TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { formatINR } from "@/lib/utils"
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
    <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Label / Name</label>
        <input
          type="text"
          value={v.child.label}
          onChange={(e) => updateChild(v.index, { label: e.target.value })}
          placeholder={`e.g., Child ${v.index + 1} School`}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
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
            className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-blue-600"
          />
          <span className="text-sm font-bold text-blue-700 min-w-[48px] text-right">{v.expReturns}%</span>
        </div>
      </div>

      {/* Per-child calculation card */}
      {v.totalLumpsumNeeded > 0 && (
        <div className="space-y-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h6 className="text-xs font-bold text-blue-900">
              {v.child.label || `Child ${v.index + 1}`} — {v.totalYears}yr schooling
            </h6>
          </div>
          <div className={`grid ${v.notInSchool ? "grid-cols-4" : "grid-cols-3"} gap-2`}>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Outflow</p>
              <p className="text-sm font-bold text-blue-800 mt-0.5">{formatINR(v.totalFeeOutflow)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
              <p className="text-sm font-bold text-blue-800 mt-0.5">{formatINR(v.totalLumpsumNeeded)}</p>
            </div>
            {v.notInSchool && (
              <div className="text-center p-2 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                <p className="text-sm font-bold text-blue-800 mt-0.5">{formatINR(v.sipNeeded)}</p>
              </div>
            )}
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Equity / Debt</p>
              <p className="text-sm font-bold text-blue-800 mt-0.5">
                {formatINR(v.lumpsumEquity)} / {formatINR(v.lumpsumDebt)}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-blue-700/70 leading-relaxed">
            {v.useDualBucket
              ? `Dual-bucket: ${v.equityCount} yr equity, ${v.debtCount} yr debt at ${v.returnPct}% blended return (equity + debt combo). 3-year glide path.`
              : `Pure equity at ${v.returnPct}% CAGR — school starts in ${v.yearsUntilSchoolStarts} yr, enough time for full equity exposure.`}
            {v.notInSchool ? ` SIP over ${v.yearsUntilSchoolStarts} yr to accumulate corpus by school start.` : " Child already in school — corpus needed now."}
          </p>
        </div>
      )}
    </div>
  )
}
