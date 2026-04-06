import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { NumberField } from "@/components/ui/number-field"
import { Plus, Trash2 } from "lucide-react"
import type { WhitegoodsSectionProps } from "../types/InputForm.types"

export function WhitegoodsSection({ items, updateWhitegood, addWhitegood, removeWhitegood }: WhitegoodsSectionProps) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Whitegoods & Replacements</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Items replaced periodically
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addWhitegood} className="bg-white/60">
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1 mr-3">
              <Label className="text-sm font-medium text-foreground/80">Item Name</Label>
              <Input
                value={item.itemName}
                onChange={(e) => updateWhitegood(idx, "itemName", e.target.value)}
                className="bg-white/60 backdrop-blur-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeWhitegood(idx)}
              className="text-destructive hover:text-destructive mt-6"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Current Cost"
              value={item.currentCost}
              onChange={(v) => updateWhitegood(idx, "currentCost", v)}
              suffix="₹"
            />
            <NumberField
              label="Replace Every"
              value={item.replacementFrequencyYears}
              onChange={(v) => updateWhitegood(idx, "replacementFrequencyYears", v)}
              suffix="years"
              min={1}
            />
            <NumberField
              label="Inflation"
              value={item.inflationPercent}
              onChange={(v) => updateWhitegood(idx, "inflationPercent", v)}
              suffix="%"
              step={0.5}
            />
          </div>
          {idx < items.length - 1 && <Separator className="bg-border/50" />}
        </div>
      ))}
    </div>
  )
}
