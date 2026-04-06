import { TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { formatINR } from "@/lib/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useHouseTab } from "./hooks/useHouseTab"

export function HouseTab(props: TabProps) {
  const { house, update, inflation, expRet, inflatedTarget, lumpsum, sip } = useHouseTab(props)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label="Target Cost (Today)"
          value={house.targetCost}
          onChange={(v) => update({ targetCost: v })}
          suffix="₹"
        />
        <NumberField
          label="Years Remaining"
          value={house.yearsRemaining}
          onChange={(v) => update({ yearsRemaining: v })}
          min={1}
        />
        <NumberField
          label="Inflation %"
          value={inflation}
          onChange={(v) => update({ inflationExpected: v })}
          suffix="%"
          step={0.5}
        />
      </div>

      {/* Expected returns slider */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-600">Expected Returns</label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={6} max={18} step={0.5} value={expRet}
            onChange={(e) => update({ expectedReturns: Number(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-orange-600"
          />
          <span className="text-sm font-bold text-orange-700 min-w-[48px] text-right">{expRet}%</span>
        </div>
      </div>

      {inflatedTarget > 0 && (
        <div className="space-y-2.5 p-3 rounded-lg bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <h6 className="text-xs font-bold text-orange-900">House Down Payment — in {house.yearsRemaining} years</h6>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inflated Target</p>
              <p className="text-sm font-bold text-orange-800 mt-0.5">{formatINR(inflatedTarget)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
              <p className="text-sm font-bold text-orange-800 mt-0.5">{formatINR(lumpsum)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/70">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
              <p className="text-sm font-bold text-orange-800 mt-0.5">{formatINR(sip)}</p>
            </div>
          </div>
          <p className="text-[10px] text-orange-700/70 leading-relaxed">
            {formatINR(house.targetCost)} today → {formatINR(inflatedTarget)} in {house.yearsRemaining} years at {inflation}% inflation.
            Lumpsum & SIP at {expRet}% expected returns.
          </p>
        </div>
      )}
    </div>
  )
}
