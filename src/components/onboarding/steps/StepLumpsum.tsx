import { useState, useMemo } from "react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { StepProps, LumpsumEntry } from "@/types/onboarding"
import type { MFScheme } from "@/services/mf-api"
import { buildGoalOptions } from "@/lib/utils"
import { NumberField } from "@/components/ui/number-field"
import { useMfSchemes } from "@/hooks/useMfSchemes"
import { calculateLumpsumUnits } from "@/services/mf-api"

function newEntry(): LumpsumEntry {
  return { id: `ls-${Date.now()}`, amc: "", schemeCode: "", fundName: "", amount: 0, dateOfInvestment: "", units: 0, goalId: "", folioNumber: "" }
}

export function StepLumpsum({ data, updateData }: StepProps) {
  const entries = data.lumpsumInvestments
  const goalOptions = buildGoalOptions(data)
  const groups = [...new Set(goalOptions.map((o) => o.group))]
  const { allSchemes, loading: schemesLoading, error: schemesError, fetchNav } = useMfSchemes()
  const [calculatingIndex, setCalculatingIndex] = useState<number | null>(null)

  function updateEntry(index: number, patch: Partial<LumpsumEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateData({ lumpsumInvestments: updated })
  }

  async function handleCalculateUnits(index: number, schemeCode: string, amount: number, date: string) {
    setCalculatingIndex(index)
    try {
      const { units, actualDate } = await calculateLumpsumUnits(schemeCode, amount, date)
      updateEntry(index, { units, dateOfInvestment: actualDate })
    } finally {
      setCalculatingIndex(null)
    }
  }

  function addEntry() {
    updateData({ lumpsumInvestments: [...entries, newEntry()] })
  }

  function removeEntry(index: number) {
    updateData({ lumpsumInvestments: entries.filter((_, i) => i !== index) })
  }

  async function handleFundSelect(idx: number, scheme: MFScheme) {
    updateEntry(idx, { schemeCode: scheme.schemeCode, fundName: scheme.schemeName, amc: scheme.fundHouse })
    try {
      await fetchNav(scheme.schemeCode)
    } catch {
      // NAV fetch failed silently — will retry later
    }
  }

  return (
    <div className="space-y-4">
      {schemesLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading mutual fund list…
        </div>
      )}
      {schemesError && (
        <p className="text-xs text-red-500">Failed to load fund list: {schemesError}</p>
      )}

      {entries.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No lumpsum investments added yet.</p>
      )}

      {entries.map((entry, idx) => (
        <LumpsumRow
          key={entry.id}
          entry={entry}
          index={idx}
          groups={groups}
          goalOptions={goalOptions}
          allSchemes={allSchemes}
          onFundSelect={handleFundSelect}
          onUpdate={updateEntry}
          onRemove={removeEntry}
          onCalculateUnits={handleCalculateUnits}
          calculatingUnits={calculatingIndex === idx}
        />
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        <Plus className="h-4 w-4" /> Add Lumpsum Investment
      </button>
    </div>
  )
}

// ── Per-entry row with local search state ─────────────────
interface LumpsumRowProps {
  entry: LumpsumEntry
  index: number
  groups: string[]
  goalOptions: ReturnType<typeof buildGoalOptions>
  allSchemes: MFScheme[]
  onFundSelect: (idx: number, scheme: MFScheme) => Promise<void>
  onUpdate: (idx: number, patch: Partial<LumpsumEntry>) => void
  onRemove: (idx: number) => void
  onCalculateUnits: (idx: number, schemeCode: string, amount: number, date: string) => Promise<void>
  calculatingUnits: boolean
}

function LumpsumRow({ entry, index, groups, goalOptions, allSchemes, onFundSelect, onUpdate, onRemove, onCalculateUnits, calculatingUnits }: LumpsumRowProps) {
  const [fundSearch, setFundSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)

  // Check if ready to calculate units
  const canCalculateUnits = entry.amount > 0 && entry.dateOfInvestment && entry.schemeCode && !calculatingUnits

  function handleCalculateClick() {
    if (!canCalculateUnits) return
    setCalcError(null)
    onCalculateUnits(index, entry.schemeCode, entry.amount, entry.dateOfInvestment)
      .catch((err: Error) => {
        setCalcError(err.message || "Failed to calculate units")
      })
  }

  const filteredFunds = useMemo(() => {
    if (!fundSearch || allSchemes.length === 0) return []
    const q = fundSearch.toLowerCase()
    return allSchemes.filter((s) => s.schemeName.toLowerCase().includes(q)).slice(0, 50)
  }, [fundSearch, allSchemes])

  return (
    <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">Investment {index + 1}</span>
        <button type="button" onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Fund name — full-width searchable */}
      <div className="space-y-1.5 relative">
        <label className="text-sm font-medium text-foreground/80">Fund Name</label>
        {entry.schemeCode ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white/60 text-sm">
              {entry.fundName}
            </span>
            <button
              type="button"
              onClick={() => {
                onUpdate(index, { schemeCode: "", fundName: "", amc: "" })
                setFundSearch("")
              }}
              className="text-xs text-slate-500 hover:text-red-500 shrink-0"
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
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            {showDropdown && filteredFunds.length > 0 && (
              <ul className="absolute z-20 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg text-sm">
                {filteredFunds.map((scheme) => (
                  <li key={scheme.schemeCode}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50"
                      onClick={() => {
                        onFundSelect(index, scheme)
                        setShowDropdown(false)
                        setFundSearch("")
                      }}
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
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
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
            <button
              type="button"
              onClick={handleCalculateClick}
              disabled={!canCalculateUnits || calculatingUnits}
              className="mt-[2px] px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-500 transition-colors whitespace-nowrap"
            >
              {calculatingUnits ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate Units"}
            </button>
          </div>
        </div>
        {calcError && <p className="text-xs text-red-500 col-span-2">{calcError}</p>}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Assign to Goal</label>
          <select
            value={entry.goalId}
            onChange={(e) => onUpdate(index, { goalId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
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
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  )
}
