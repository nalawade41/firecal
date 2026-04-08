import { Trash2, Loader2 } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/ui/glass-panel"
import type { LumpsumRowProps } from "./types/Steps.types"
import { useLumpsumRow } from "./hooks/useLumpsumRow"

export function LumpsumRow(props: LumpsumRowProps) {
  const { entry, index, groups, goalOptions, onUpdate, onRemove, calculatingUnits } = props
  const {
    fundSearch, setFundSearch,
    showDropdown, setShowDropdown,
    calcError, canCalculateUnits, handleCalculateClick,
    filteredFunds, handleChangeFund, handleSelectScheme,
  } = useLumpsumRow(props)

  return (
    <GlassPanel
      className="!p-4 !space-y-3"
      title={`Investment ${index + 1}`}
      headerAction={
        <Button type="button" variant="ghost" size="icon-xs" onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    >

      {/* Fund name — full-width searchable */}
      <div className="space-y-1.5 relative">
        <label className="text-sm font-medium text-foreground/80">Fund Name</label>
        {entry.schemeCode ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 px-3 py-2 rounded-lg border border-[var(--wt-input-border)] bg-white/60 text-sm">
              {entry.fundName}
            </span>
            <button
              type="button"
              onClick={handleChangeFund}
              className="text-xs text-[var(--wt-ink3)] hover:text-red-500 shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={fundSearch}
              onChange={(e) => { setFundSearch(e.target.value); setShowDropdown(true) }}
              onFocus={() => { if (fundSearch) setShowDropdown(true) }}
              placeholder="Type to search fund name…"
              className="w-full wt-form-input"
            />
            {showDropdown && filteredFunds.length > 0 && (
              <ul className="absolute z-20 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-[var(--wt-input-border)] bg-white shadow-lg text-sm">
                {filteredFunds.map((scheme) => (
                  <li key={scheme.schemeCode}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-[var(--wt-green-light)]"
                      onClick={() => handleSelectScheme(scheme)}
                    >
                      {scheme.schemeName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumberField
          label="Amount"
          value={entry.amount}
          onChange={(v) => onUpdate(index, { amount: v })}
          suffix="₹"
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Date of Investment</label>
          <input
            type="date"
            value={entry.dateOfInvestment}
            onChange={(e) => onUpdate(index, { dateOfInvestment: e.target.value })}
            className="w-full wt-form-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Units</label>
          <div className="flex items-center gap-2">
            <NumberField
              label=""
              value={entry.units}
              onChange={(v) => onUpdate(index, { units: v })}
              step={0.001}
              suffix={calculatingUnits ? "Calculating..." : calcError ? "Error" : undefined}
            />
            <Button
              type="button"
              onClick={handleCalculateClick}
              disabled={!canCalculateUnits || calculatingUnits}
              className="mt-[2px] bg-[var(--wt-green)] text-white hover:bg-[var(--wt-green)]/90 whitespace-nowrap"
            >
              {calculatingUnits ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate Units"}
            </Button>
          </div>
        </div>
        {calcError && <p className="text-xs text-red-500 col-span-2">{calcError}</p>}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Assign to Goal</label>
          <select
            value={entry.goalId}
            onChange={(e) => onUpdate(index, { goalId: e.target.value })}
            className="w-full wt-form-input"
          >
            <option value="">— Select Goal —</option>
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {goalOptions
                  .filter((o) => o.group === group)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">
            Folio Number <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            value={entry.folioNumber}
            onChange={(e) => onUpdate(index, { folioNumber: e.target.value })}
            placeholder="e.g., 12345678"
            className="w-full wt-form-input"
          />
        </div>
      </div>
    </GlassPanel>
  )
}
