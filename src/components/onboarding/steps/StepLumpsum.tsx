import { Plus, Loader2 } from "lucide-react"
import type { StepProps } from "@/types/onboarding"
import { useStepLumpsum } from "./hooks/useStepLumpsum"
import { LumpsumRow } from "./LumpsumRow"

export function StepLumpsum(props: StepProps) {
  const {
    entries, goalOptions, groups, allSchemes,
    schemesLoading, schemesError, calculatingIndex,
    updateEntry, addEntry, removeEntry,
    handleFundSelect, handleCalculateUnits,
  } = useStepLumpsum(props)

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
