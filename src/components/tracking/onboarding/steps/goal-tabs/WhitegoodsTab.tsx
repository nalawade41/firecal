import { Plus, Trash2, TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertPanel } from "@/components/ui/alert-panel"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useWhitegoodsTab } from "./hooks/useWhitegoodsTab"

export function WhitegoodsTab(props: TabProps) {
  const { itemViews, updateItem, addItem, removeItem, canRemove } = useWhitegoodsTab(props)

  return (
    <div className="space-y-4">
      {itemViews.map((iv) => (
        <GlassPanel key={iv.index} variant="light" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <label className="text-xs font-medium text-slate-600">Item Name</label>
              <input
                type="text"
                value={iv.item.itemName}
                onChange={(e) => updateItem(iv.index, { itemName: e.target.value })}
                placeholder="e.g., Refrigerator, Laptop"
                className="w-full mt-1 wt-form-input"
              />
            </div>
            {canRemove && (
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeItem(iv.index)} className="text-red-400 hover:text-red-600 mt-4">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Current Cost"
              value={iv.item.currentCost}
              onChange={(val) => updateItem(iv.index, { currentCost: val })}
              suffix="₹"
            />
            <NumberField
              label="Inflation"
              value={iv.item.inflationExpected}
              onChange={(val) => updateItem(iv.index, { inflationExpected: val })}
              suffix="%"
              step={0.5}
            />
            <NumberField
              label="Replace Every"
              value={iv.item.replacementFrequencyYears}
              onChange={(val) => updateItem(iv.index, { replacementFrequencyYears: val })}
              suffix="years"
              min={1}
            />
          </div>
          {/* Expected returns slider */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Expected Returns</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={6} max={18} step={0.5} value={iv.expRet}
                onChange={(e) => updateItem(iv.index, { expectedReturns: Number(e.target.value) })}
                className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
              />
              <span className="text-sm font-bold text-teal-700 min-w-[48px] text-right">{iv.expRet}%</span>
            </div>
          </div>

          {iv.inflatedCost > 0 && (
            <AlertPanel
              variant="green"
              icon={<TrendingUp className="h-4 w-4" />}
              title={`${iv.item.itemName || `Item ${iv.index + 1}`} — every ${iv.horizon} years`}
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Inflated Cost</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(iv.inflatedCost)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(iv.lumpsum)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold mt-0.5">{formatINR(iv.sip)}</p>
                </div>
              </div>
              <p className="text-[10px] opacity-70 leading-relaxed mt-2">
                {formatINR(iv.item.currentCost)} today → {formatINR(iv.inflatedCost)} in {iv.horizon} years at {iv.item.inflationExpected}% inflation.
                Lumpsum & SIP at {iv.expRet}% expected returns.
              </p>
            </AlertPanel>
          )}
        </GlassPanel>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addItem}
        className="text-[var(--wt-green)] hover:text-[var(--wt-green)]"
      >
        <Plus className="h-4 w-4" /> Add Item
      </Button>
    </div>
  )
}
