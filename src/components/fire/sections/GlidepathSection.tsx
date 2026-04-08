import { Button } from "@/components/ui/button"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { Plus, Trash2 } from "lucide-react"
import type { GlidepathSectionProps } from "../types/FireForm.types"

export function GlidepathSection({ checkpoints, updateGlidepath, addCheckpoint, removeCheckpoint }: GlidepathSectionProps) {
  return (
    <GlassPanel
      title="Glidepath Checkpoints"
      description="Equity allocation by age (linearly interpolated)"
      headerAction={
        <Button variant="outline" size="sm" onClick={addCheckpoint} className="bg-white/60">
          <Plus className="h-4 w-4 mr-1" /> Add Checkpoint
        </Button>
      }
    >
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
    </GlassPanel>
  )
}
