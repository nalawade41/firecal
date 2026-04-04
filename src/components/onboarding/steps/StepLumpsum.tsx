import { Plus, Trash2 } from "lucide-react"
import type { StepProps, LumpsumEntry } from "@/types/onboarding"
import { buildGoalOptions } from "@/lib/utils"
import { NumberField } from "@/components/ui/number-field"

function newEntry(): LumpsumEntry {
  return { id: `ls-${Date.now()}`, fundName: "", amount: 0, dateOfInvestment: "", units: 0, goalId: "", folioNumber: "" }
}

export function StepLumpsum({ data, updateData }: StepProps) {
  const entries = data.lumpsumInvestments
  const goalOptions = buildGoalOptions(data)
  const groups = [...new Set(goalOptions.map((o) => o.group))]

  function updateEntry(index: number, patch: Partial<LumpsumEntry>) {
    const updated = [...entries]
    updated[index] = { ...updated[index], ...patch }
    updateData({ lumpsumInvestments: updated })
  }

  function addEntry() {
    updateData({ lumpsumInvestments: [...entries, newEntry()] })
  }

  function removeEntry(index: number) {
    updateData({ lumpsumInvestments: entries.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No lumpsum investments added yet.</p>
      )}

      {entries.map((entry, idx) => (
        <div key={entry.id} className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Investment {idx + 1}</span>
            <button type="button" onClick={() => removeEntry(idx)} className="text-red-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Fund Name</label>
              <input
                type="text"
                value={entry.fundName}
                onChange={(e) => updateEntry(idx, { fundName: e.target.value })}
                placeholder="e.g., Axis Bluechip Fund"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <NumberField
              label="Amount"
              value={entry.amount}
              onChange={(v) => updateEntry(idx, { amount: v })}
              suffix="₹"
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Date of Investment</label>
              <input
                type="date"
                value={entry.dateOfInvestment}
                onChange={(e) => updateEntry(idx, { dateOfInvestment: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <NumberField
              label="Units"
              value={entry.units}
              onChange={(v) => updateEntry(idx, { units: v })}
              step={0.001}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Assign to Goal</label>
              <select
                value={entry.goalId}
                onChange={(e) => updateEntry(idx, { goalId: e.target.value })}
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
                onChange={(e) => updateEntry(idx, { folioNumber: e.target.value })}
                placeholder="e.g., 12345678"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
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
