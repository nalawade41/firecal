import { TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { formatINR } from "@/lib/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useGraduationTab } from "./hooks/useGraduationTab"

export function GraduationTab(props: TabProps) {
  const { entryViews, updateEntry } = useGraduationTab(props)

  return (
    <div className="space-y-6">
      {entryViews.map((ev) => (
        <div key={ev.index} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Label / Name</label>
            <input
              type="text"
              value={ev.entry.label}
              onChange={(e) => updateEntry(ev.index, { label: e.target.value })}
              placeholder={`e.g., Child ${ev.index + 1} Engineering`}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Cost Today"
              value={ev.entry.graduationCostCurrent}
              onChange={(val) => updateEntry(ev.index, { graduationCostCurrent: val })}
              suffix="₹"
            />
            <NumberField
              label="Inflation %"
              value={ev.entry.expectedInflationYearly}
              onChange={(val) => updateEntry(ev.index, { expectedInflationYearly: val })}
              suffix="%"
              step={0.5}
            />
            <NumberField
              label="Years to Grad"
              value={ev.horizon}
              onChange={(val) => updateEntry(ev.index, { horizonYears: val })}
              min={1}
            />
          </div>

          {/* Expected returns slider */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Expected Returns</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={6} max={18} step={0.5} value={ev.expRet}
                onChange={(e) => updateEntry(ev.index, { expectedReturns: Number(e.target.value) })}
                className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-purple-600"
              />
              <span className="text-sm font-bold text-purple-700 min-w-[48px] text-right">{ev.expRet}%</span>
            </div>
          </div>

          {ev.targetCorpus > 0 && (
            <div className="space-y-2.5 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <h6 className="text-xs font-bold text-purple-900">
                  {ev.entry.label || `Child ${ev.index + 1}`} — in {ev.horizon} years
                </h6>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Target Corpus</p>
                  <p className="text-sm font-bold text-purple-800 mt-0.5">{formatINR(ev.targetCorpus)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold text-purple-800 mt-0.5">{formatINR(ev.lumpsumNeeded)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold text-purple-800 mt-0.5">{formatINR(ev.sipNeeded)}</p>
                </div>
              </div>
              <p className="text-[10px] text-purple-700/70 leading-relaxed">
                {formatINR(ev.entry.graduationCostCurrent)} today → {formatINR(ev.targetCorpus)} in {ev.horizon} years at {ev.entry.expectedInflationYearly}% inflation.
                Lumpsum & SIP at {ev.expRet}% expected returns.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
