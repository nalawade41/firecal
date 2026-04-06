import type { RowProps } from "../types/ResultsSummary.types"

export function Row({ label, value, bold }: RowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  )
}
