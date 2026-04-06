import { Plus, Trash2, TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { formatINR } from "@/lib/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useMarriageTab } from "./hooks/useMarriageTab"

export function MarriageTab(props: TabProps) {
  const { entryViews, updateEntry, addEntry, removeEntry, canRemove } = useMarriageTab(props)

  return (
    <div className="space-y-4">
      {entryViews.map((ev) => (
        <div key={ev.index} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <label className="text-xs font-medium text-slate-600">Label / For Whom</label>
              <input
                type="text"
                value={ev.entry.label}
                onChange={(e) => updateEntry(ev.index, { label: e.target.value })}
                placeholder="e.g., Daughter's Marriage, Own Marriage, Sister's Marriage"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            {canRemove && (
              <button type="button" onClick={() => removeEntry(ev.index)} className="text-red-400 hover:text-red-600 mt-4">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Cost (Current)"
              value={ev.entry.marriageCostCurrent}
              onChange={(val) => updateEntry(ev.index, { marriageCostCurrent: val })}
              suffix="₹"
            />
            <NumberField
              label="Years Remaining"
              value={ev.entry.yearsRemaining}
              onChange={(val) => updateEntry(ev.index, { yearsRemaining: val })}
              min={1}
            />
            <NumberField
              label="Inflation %"
              value={ev.entry.expectedInflationYearly}
              onChange={(val) => updateEntry(ev.index, { expectedInflationYearly: val })}
              suffix="%"
              step={0.5}
            />
            <NumberField
              label="Safety Buffer %"
              value={ev.buffer}
              onChange={(val) => updateEntry(ev.index, { bufferPercent: val })}
              suffix="%"
              step={0.5}
            />
          </div>

          {/* Expected returns slider */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Expected Returns</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={6} max={18} step={0.5} value={ev.expRet}
                onChange={(e) => updateEntry(ev.index, { expectedReturns: Number(e.target.value) })}
                className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-pink-600"
              />
              <span className="text-sm font-bold text-pink-700 min-w-[48px] text-right">{ev.expRet}%</span>
            </div>
          </div>

          {ev.targetCorpus > 0 && (
            <div className="space-y-2.5 p-3 rounded-lg bg-pink-50 border border-pink-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-pink-600" />
                <h6 className="text-xs font-bold text-pink-900">
                  {ev.entry.label || `Entry ${ev.index + 1}`} — in {ev.entry.yearsRemaining} years
                </h6>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Target (+ Buffer)</p>
                  <p className="text-sm font-bold text-pink-800 mt-0.5">{formatINR(ev.targetCorpus)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold text-pink-800 mt-0.5">{formatINR(ev.lumpsumNeeded)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold text-pink-800 mt-0.5">{formatINR(ev.sipNeeded)}</p>
                </div>
              </div>
              <p className="text-[10px] text-pink-700/70 leading-relaxed">
                Inflated: {formatINR(ev.inflatedCorpus)} + {ev.buffer}% buffer = {formatINR(ev.targetCorpus)}.
                At {ev.entry.expectedInflationYearly}% inflation, {ev.expRet}% expected returns over {ev.entry.yearsRemaining} years.
              </p>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        <Plus className="h-4 w-4" /> Add Another Marriage Goal
      </button>
    </div>
  )
}
