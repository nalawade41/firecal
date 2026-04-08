import { Plus, Trash2, TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertPanel } from "@/components/ui/alert-panel"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useMarriageTab } from "./hooks/useMarriageTab"

export function MarriageTab(props: TabProps) {
  const { entryViews, updateEntry, addEntry, removeEntry, canRemove } = useMarriageTab(props)

  return (
    <div className="space-y-4">
      {entryViews.map((ev) => (
        <GlassPanel key={ev.index} variant="light" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <label className="text-xs font-medium text-slate-600">Label / For Whom</label>
              <input
                type="text"
                value={ev.entry.label}
                onChange={(e) => updateEntry(ev.index, { label: e.target.value })}
                placeholder="e.g., Daughter's Marriage, Own Marriage, Sister's Marriage"
                className="w-full mt-1 wt-form-input"
              />
            </div>
            {canRemove && (
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeEntry(ev.index)} className="text-red-400 hover:text-red-600 mt-4">
                <Trash2 className="h-4 w-4" />
              </Button>
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
                className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
              />
              <span className="text-sm font-bold text-pink-700 min-w-[48px] text-right">{ev.expRet}%</span>
            </div>
          </div>

          {ev.targetCorpus > 0 && (
            <AlertPanel
              variant="amber"
              icon={<TrendingUp className="h-4 w-4" />}
              title={`${ev.entry.label || `Entry ${ev.index + 1}`} — in ${ev.entry.yearsRemaining} years`}
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Target (+ Buffer)</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(ev.targetCorpus)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(ev.lumpsumNeeded)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(ev.sipNeeded)}</p>
                </div>
              </div>
              <p className="text-[10px] opacity-70 leading-relaxed mt-2">
                Inflated: {formatINR(ev.inflatedCorpus)} + {ev.buffer}% buffer = {formatINR(ev.targetCorpus)}.
                At {ev.entry.expectedInflationYearly}% inflation, {ev.expRet}% expected returns over {ev.entry.yearsRemaining} years.
              </p>
            </AlertPanel>
          )}
        </GlassPanel>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addEntry}
        className="text-[var(--wt-green)] hover:text-[var(--wt-green)]"
      >
        <Plus className="h-4 w-4" /> Add Another Marriage Goal
      </Button>
    </div>
  )
}
