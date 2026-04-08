import { AlertTriangle, TrendingUp } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { AlertPanel } from "@/components/ui/alert-panel"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/utils"
import type { TabProps } from "./types/GoalTabs.types"
import { useFireTab } from "./hooks/useFireTab"

export function FireTab(props: TabProps) {
  const {
    fire, update, model, swr, postRetReturn, preRetReturn,
    yearsToFire, yearsInRetirement, lifeExpectancy,
    selectedCorpus, selectedLumpsum, selectedSip,
    safeCorpus, safeLumpsum, safeSip, swrWarning,
  } = useFireTab(props)

  return (
    <div className="space-y-5">
      <NumberField
        label="Target FIRE Age"
        value={fire.targetAge}
        onChange={(v) => update({ targetAge: v })}
        min={30}
        max={100}
      />

      <NumberField
        label="Inflation Assumed"
        value={fire.inflationAssumed}
        onChange={(v) => update({ inflationAssumed: v })}
        suffix="%"
        step={0.5}
      />

      {/* Model toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Calculation Model</label>
        <div className="flex rounded-lg border border-[var(--wt-divider)] overflow-hidden">
          <Button
            type="button"
            variant={model === "finite" ? "default" : "ghost"}
            size="sm"
            onClick={() => update({ fireModel: "finite" })}
            className={`flex-1 rounded-none ${
              model === "finite"
                ? "bg-[var(--wt-green)] text-white hover:bg-[var(--wt-green)]"
                : ""
            }`}
          >
            Finite ({yearsInRetirement}yr)
          </Button>
          <Button
            type="button"
            variant={model === "perpetual" ? "default" : "ghost"}
            size="sm"
            onClick={() => update({ fireModel: "perpetual" })}
            className={`flex-1 rounded-none ${
              model === "perpetual"
                ? "bg-[var(--wt-green)] text-white hover:bg-[var(--wt-green)]"
                : ""
            }`}
          >
            Perpetual (SWR)
          </Button>
        </div>
      </div>

      {/* Conditional slider based on model */}
      {model === "perpetual" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Safe Withdrawal Rate</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0} max={10} step={0.25} value={swr}
              onChange={(e) => update({ safeWithdrawalRate: Number(e.target.value) })}
              className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
            />
            <span className="text-sm font-bold text-emerald-700 min-w-[48px] text-right">{swr}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
            <span>0%</span>
            <span className="text-amber-500 font-medium">2.5% (conservative)</span>
            <span className="text-emerald-600 font-medium">3.5% (standard)</span>
            <span>10%</span>
          </div>
          {swrWarning && (
            <AlertPanel variant="amber" icon={<AlertTriangle className="h-4 w-4 flex-shrink-0" />}>
              <p className="text-xs">{swrWarning}</p>
            </AlertPanel>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Post-Retirement Returns</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={4} max={14} step={0.5} value={postRetReturn}
              onChange={(e) => update({ postRetirementReturn: Number(e.target.value) })}
              className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
            />
            <span className="text-sm font-bold text-emerald-700 min-w-[48px] text-right">{postRetReturn}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
            <span>4%</span>
            <span className="text-amber-500 font-medium">8% (conservative)</span>
            <span className="text-emerald-600 font-medium">10% (balanced)</span>
            <span>14%</span>
          </div>
        </div>
      )}

      {/* Pre-retirement expected returns slider */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Expected Pre-Retirement Returns</label>
        <div className="flex items-center gap-3">
          <input
            type="range" min={6} max={18} step={0.5} value={preRetReturn}
            onChange={(e) => update({ expectedReturns: Number(e.target.value) })}
            className="flex-1 h-2 rounded-full appearance-none bg-[var(--wt-divider)] accent-[var(--wt-green)]"
          />
          <span className="text-sm font-bold text-emerald-700 min-w-[48px] text-right">{preRetReturn}%</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
          <span>6%</span>
          <span className="text-emerald-600 font-medium">12% (equity)</span>
          <span>18%</span>
        </div>
      </div>

      {/* Calculation cards */}
      {yearsToFire > 0 && selectedCorpus > 0 && (
        <div className="space-y-4">
          {/* Selected model card */}
          <AlertPanel
            variant="green"
            icon={<TrendingUp className="h-5 w-5" />}
            title={model === "finite" ? "Finite Estimate" : "SWR Estimate"}
          >
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--wt-green-light)] font-medium">
              {model === "finite"
                ? `${yearsInRetirement}yr · ${postRetReturn}% returns`
                : `Perpetual · ${swr}% SWR`}
            </span>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="text-center p-2.5 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Corpus</p>
                <p className="text-sm font-bold mt-1">{formatINR(selectedCorpus)}</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                <p className="text-sm font-bold mt-1">{formatINR(selectedLumpsum)}</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-white/70">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                <p className="text-sm font-bold mt-1">{formatINR(selectedSip)}</p>
              </div>
            </div>
            <p className="text-[10px] opacity-70 leading-relaxed mt-2">
              {model === "finite"
                ? `Corpus lasts ${yearsInRetirement} years (age ${fire.targetAge}–${lifeExpectancy}) at ${fire.inflationAssumed}% inflation and ${postRetReturn}% post-retirement returns.`
                : `Corpus never depletes at ${swr}% annual withdrawal and ${fire.inflationAssumed}% inflation.`}
              {" "}Lumpsum & SIP assume {preRetReturn}% pre-retirement returns over {yearsToFire} years.
            </p>
          </AlertPanel>

          {/* Safe target card — midpoint */}
          {safeCorpus > 0 && (
            <AlertPanel
              variant="amber"
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Recommended Safe Target"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Corpus</p>
                  <p className="text-sm font-bold mt-1">{formatINR(safeCorpus)}</p>
                </div>
                <div className="text-center p-2.5 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum Today</p>
                  <p className="text-sm font-bold mt-1">{formatINR(safeLumpsum)}</p>
                </div>
                <div className="text-center p-2.5 rounded-lg bg-white/70">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Monthly SIP</p>
                  <p className="text-sm font-bold mt-1">{formatINR(safeSip)}</p>
                </div>
              </div>
              <p className="text-[10px] opacity-80 leading-relaxed mt-2">
                Average of both models. Accounts for real-world uncertainty — market volatility,
                sequence-of-returns risk, unexpected expenses, and potential policy or tax changes.
                A middle ground between optimistic and conservative planning.
              </p>
            </AlertPanel>
          )}
        </div>
      )}
    </div>
  )
}
