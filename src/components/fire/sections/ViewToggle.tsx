import { Button } from "@/components/ui/button"
import type { ViewToggleProps } from "../types/FireTable.types"

export function ViewToggle({ view, onToggle }: ViewToggleProps) {
  return (
    <div className="flex gap-1 mb-3">
      <Button
        size="sm"
        variant={view === "expenses" ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onToggle("expenses")}
      >
        Expenses
      </Button>
      <Button
        size="sm"
        variant={view === "portfolio" ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onToggle("portfolio")}
      >
        Portfolio
      </Button>
    </div>
  )
}
