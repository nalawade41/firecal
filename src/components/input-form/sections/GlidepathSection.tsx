import { Button } from "@/components/ui/button"
import { NumberField } from "@/components/ui/number-field"
import { Plus, Trash2 } from "lucide-react"
import type { GlidepathSectionProps } from "../types/InputForm.types"

export function GlidepathSection({ checkpoints, updateGlidepath, addCheckpoint, removeCheckpoint }: GlidepathSectionProps) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Glidepath Checkpoints</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Equity allocation by age (linearly interpolated)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addCheckpoint} className="bg-white/60">
          <Plus className="h-4 w-4 mr-1" /> Add Checkpoint
        </Button>
      </div>
      {checkpoints.map((cp, idx) => (
        <div key={idx} className="flex items-end gap-3">
          <NumberField
            label={`Age ${idx + 1}`}
            value={cp.age}
            onChange={(v) => updateGlidepath(idx, "age", v)}
          />
          <NumberField
            label="Equity %"
            value={cp.equityPercent}
            onChange={(v) => updateGlidepath(idx, "equityPercent", v)}
            suffix="%"
            min={0}
            max={100}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCheckpoint(idx)}
            className="text-destructive hover:text-destructive mb-0.5"
            disabled={checkpoints.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
