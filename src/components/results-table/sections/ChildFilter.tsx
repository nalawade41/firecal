import { Button } from "@/components/ui/button"
import type { ChildFilterProps } from "../types/ResultsTable.types"

export function ChildFilter({ childCount, selected, onSelect }: ChildFilterProps) {
  if (childCount <= 1) return null
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-medium text-muted-foreground">Filter:</span>
      <Button
        size="sm"
        variant={selected === -1 ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onSelect(-1)}
      >
        All Children
      </Button>
      {Array.from({ length: childCount }, (_, i) => (
        <Button
          key={i}
          size="sm"
          variant={selected === i ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => onSelect(i)}
        >
          Child {i + 1}
        </Button>
      ))}
    </div>
  )
}
