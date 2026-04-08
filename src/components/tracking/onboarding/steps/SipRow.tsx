import { Trash2 } from "lucide-react"
import { NumberField } from "@/components/ui/number-field"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/ui/glass-panel"
import type { SipRowProps } from "./types/Steps.types"
import { useSipRow } from "./hooks/useSipRow"

export function SipRow(props: SipRowProps) {
  const { entry, index, groups, goalOptions, onUpdate, onRemove } = props
  const {
    fundSearch, setFundSearch,
    showDropdown, setShowDropdown,
    filteredFunds, handleChangeFund, handleSelectScheme,
  } = useSipRow(props)

  return (
    <GlassPanel
      className="!p-4 !space-y-3"
      title={`SIP ${index + 1}`}
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
          label="Monthly Amount"
          value={entry.amount}
          onChange={(v) => onUpdate(index, { amount: v })}
          suffix="₹"
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Start Date</label>
          <input
            type="date"
            value={entry.startDate}
            onChange={(e) => onUpdate(index, { startDate: e.target.value })}
            className="w-full wt-form-input"
          />
        </div>

        <NumberField
          label="Units Till Now"
          value={entry.unitsTillNow}
          onChange={(v) => onUpdate(index, { unitsTillNow: v })}
          step={0.001}
        />

        {/* SIP Status Toggle */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">SIP Status</label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => onUpdate(index, { isActive: true, endDate: undefined })}
              className={entry.isActive
                ? "bg-[var(--wt-green)] text-white hover:bg-[var(--wt-green)]/90"
                : "bg-[var(--wt-mist)] text-[var(--wt-ink2)] hover:bg-[var(--wt-foam)]"
              }
              size="sm"
            >
              In Progress
            </Button>
            <Button
              type="button"
              onClick={() => onUpdate(index, { isActive: false })}
              className={!entry.isActive
                ? "bg-[var(--wt-amber)] text-white hover:bg-[var(--wt-amber)]/90"
                : "bg-[var(--wt-mist)] text-[var(--wt-ink2)] hover:bg-[var(--wt-foam)]"
              }
              size="sm"
            >
              Ended
            </Button>
          </div>
        </div>

        {/* End Date - only shown when SIP is ended */}
        {!entry.isActive && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">End Date</label>
            <input
              type="date"
              value={entry.endDate}
              onChange={(e) => onUpdate(index, { endDate: e.target.value })}
              className="w-full wt-form-input"
            />
          </div>
        )}

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
