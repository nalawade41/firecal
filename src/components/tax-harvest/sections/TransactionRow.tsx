import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

import type { TransactionRowProps } from "../types/TaxHarvestForm.types"
import { TRANSACTION_TYPE_OPTIONS } from "../constants/TaxHarvestForm.constants"

export function TransactionRow({ transaction: tx, index, onUpdate, onRemove }: TransactionRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-end p-3 rounded-[var(--wt-r-sm)] border border-[var(--wt-divider)] bg-[var(--wt-input-bg)]">
      <div className="col-span-2 space-y-1">
        <Label className="wt-label">Date</Label>
        <Input
          type="date"
          value={tx.date.toISOString().split("T")[0]}
          onChange={(e) => onUpdate(index, "date", new Date(e.target.value))}
          className="wt-form-input h-8"
        />
      </div>
      <div className="col-span-2 space-y-1">
        <Label className="wt-label">Type</Label>
        <select
          value={tx.type}
          onChange={(e) => onUpdate(index, "type", e.target.value)}
          className="wt-form-input w-full h-8"
        >
          {TRANSACTION_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 space-y-1">
        <Label className="wt-label">Units</Label>
        <Input
          type="number"
          value={tx.units || ""}
          onChange={(e) => onUpdate(index, "units", parseFloat(e.target.value) || 0)}
          step="0.001"
          className="wt-form-input h-8 font-[var(--wt-font-mono)]"
        />
      </div>
      <div className="col-span-2 space-y-1">
        <Label className="wt-label">Buy NAV</Label>
        <Input
          type="number"
          value={tx.navPerUnit || ""}
          onChange={(e) => onUpdate(index, "navPerUnit", parseFloat(e.target.value) || 0)}
          step="0.01"
          className="wt-form-input h-8 font-[var(--wt-font-mono)]"
        />
      </div>
      <div className="col-span-3 space-y-1">
        <Label className="wt-label">Amount (Auto)</Label>
        <Input
          type="number"
          value={tx.amount || ""}
          readOnly
          className="wt-form-input h-8 font-[var(--wt-font-mono)] opacity-60"
        />
      </div>
      <div className="col-span-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(index)}
          className="text-[var(--wt-red)] hover:text-[var(--wt-red)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
