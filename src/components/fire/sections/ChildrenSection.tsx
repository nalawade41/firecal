import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { Plus, Trash2 } from "lucide-react"
import type { ChildrenSectionProps } from "../types/FireForm.types"

export function ChildrenSection({ children, updateChild, addChild, removeChild }: ChildrenSectionProps) {
  return (
    <GlassPanel
      title="Children"
      description="Up to 5 children with milestone ages"
      headerAction={
        <Button
          variant="outline"
          size="sm"
          onClick={addChild}
          disabled={children.length >= 5}
          className="bg-white/60"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Child
        </Button>
      }
    >
      {children.map((child, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Child {idx + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeChild(idx)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <NumberField
              label="Current Age"
              value={child.currentAge}
              onChange={(v) => updateChild(idx, "currentAge", v)}
              min={0}
            />
            <NumberField
              label="School Start"
              value={child.schoolStartAge}
              onChange={(v) => updateChild(idx, "schoolStartAge", v)}
              min={3}
            />
            <NumberField
              label="Graduation Start"
              value={child.graduationStartAge}
              onChange={(v) => updateChild(idx, "graduationStartAge", v)}
            />
            <NumberField
              label="PG Start"
              value={child.postGraduationStartAge}
              onChange={(v) => updateChild(idx, "postGraduationStartAge", v)}
            />
            <NumberField
              label="Marriage Age"
              value={child.marriageAge}
              onChange={(v) => updateChild(idx, "marriageAge", v)}
            />
          </div>
          {idx < children.length - 1 && <Separator className="bg-border/50" />}
        </div>
      ))}
      {children.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No children added. Click "Add Child" to include education and marriage planning.
        </p>
      )}
    </GlassPanel>
  )
}
