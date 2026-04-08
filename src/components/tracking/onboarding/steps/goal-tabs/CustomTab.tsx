import { TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertPanel } from "@/components/ui/alert-panel"
import { formatINR } from "@/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useCustomTab } from "./hooks/useCustomTab"

export function CustomTab(props: TabProps) {
  const { entryViews, updateEntry, isEmpty } = useCustomTab(props)

  if (isEmpty) {
    return (
      <div className="text-center py-6 text-slate-500">
        <p className="text-sm">No custom goals defined. Go back to goal selection to add one.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entryViews.map((ev) => (
        <GlassPanel key={ev.defId} variant="light" className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800">{ev.defName}</h4>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Target Cost (Today)"
              value={ev.entry.targetCost}
              onChange={(val) => updateEntry(ev.defId, { targetCost: val })}
              suffix="₹"
            />
            <NumberField
              label="Years Remaining"
              value={ev.entry.yearsRemaining}
              onChange={(val) => updateEntry(ev.defId, { yearsRemaining: val })}
              min={1}
            />
            <NumberField
              label="Inflation %"
              value={ev.inflation}
              onChange={(val) => updateEntry(ev.defId, { inflationExpected: val })}
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
                onChange={(e) => updateEntry(ev.defId, { expectedReturns: Number(e.target.value) })}
                className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
              />
              <span className="text-sm font-bold text-indigo-700 min-w-[48px] text-right">{ev.expRet}%</span>
            </div>
          </div>

          {ev.inflatedTarget > 0 && (
            <AlertPanel
              variant="blue"
              icon={<TrendingUp className="h-4 w-4" />}
              title={`${ev.defName} — in ${ev.entry.yearsRemaining} years`}
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inflated Target</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(ev.inflatedTarget)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(ev.lumpsum)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(ev.sip)}</p>
                </div>
              </div>
              <p className="text-[10px] opacity-70 leading-relaxed mt-2">
                {formatINR(ev.entry.targetCost)} today → {formatINR(ev.inflatedTarget)} in {ev.entry.yearsRemaining} years at {ev.inflation}% inflation.
                Lumpsum & SIP at {ev.expRet}% expected returns.
              </p>
            </AlertPanel>
          )}
        </GlassPanel>
      ))}
    </div>
  )
}
