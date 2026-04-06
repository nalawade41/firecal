import { Plus, Loader2 } from "lucide-react"
import type { StepProps } from "@/types/onboarding"
import { useStepSip } from "./hooks/useStepSip"
import { SipRow } from "./SipRow"

export function StepSip(props: StepProps) {
  const {
    entries, goalOptions, groups, allSchemes,
    schemesLoading, schemesError,
    updateEntry, addEntry, removeEntry, handleFundSelect,
  } = useStepSip(props)

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
        <p className="text-sm text-slate-500 text-center py-4">No SIPs added yet.</p>
      )}

      {entries.map((entry, idx) => (
        <SipRow
          key={entry.id}
          entry={entry}
          index={idx}
          groups={groups}
          goalOptions={goalOptions}
          allSchemes={allSchemes}
          onFundSelect={handleFundSelect}
          onUpdate={updateEntry}
          onRemove={removeEntry}
        />
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        <Plus className="h-4 w-4" /> Add SIP
      </button>
    </div>
  )
}
