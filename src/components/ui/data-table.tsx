import type { ReactNode } from "react"
import { cn } from "@/utils"

interface DataTableProps {
  children: ReactNode
  className?: string
  /** Max height with vertical scroll. Default: "600px" */
  maxHeight?: string
}

export function DataTable({ children, className, maxHeight = "600px" }: DataTableProps) {
  return (
    <div className={cn("overflow-y-auto pr-2", className)} style={{ maxHeight }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    </div>
  )
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 bg-[var(--wt-mist)] z-10">
      {children}
    </thead>
  )
}

export function DataTableHeaderRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-[var(--wt-divider)]">
      {children}
    </tr>
  )
}

interface ThProps {
  children: ReactNode
  align?: "left" | "right" | "center"
  className?: string
}

export function Th({ children, align = "left", className }: ThProps) {
  return (
    <th className={cn(
      "py-2 px-3 wt-label",
      align === "right" && "text-right",
      align === "center" && "text-center",
      className,
    )}>
      {children}
    </th>
  )
}

interface TdProps {
  children: ReactNode
  align?: "left" | "right" | "center"
  /** Render content in monospace (for financial values) */
  mono?: boolean
  className?: string
}

export function Td({ children, align = "left", mono, className }: TdProps) {
  return (
    <td className={cn(
      "py-2 px-3",
      align === "right" && "text-right",
      align === "center" && "text-center",
      mono && "font-['DM_Mono',monospace]",
      className,
    )}>
      {children}
    </td>
  )
}

interface DataTableRowProps {
  children: ReactNode
  highlight?: "green" | "amber" | "red" | "none"
  className?: string
}

const ROW_HIGHLIGHT: Record<string, string> = {
  green: "bg-[var(--wt-green-light)]/20",
  amber: "bg-[var(--wt-amber-light)]/20",
  red:   "bg-[var(--wt-red-light)]/20",
  none:  "",
}

export function DataTableRow({ children, highlight = "none", className }: DataTableRowProps) {
  return (
    <tr className={cn("border-b border-[var(--wt-divider)]", ROW_HIGHLIGHT[highlight], className)}>
      {children}
    </tr>
  )
}
