import type { ReactNode } from "react"
import { cn } from "@/utils"

type AlertVariant = "green" | "amber" | "red" | "blue"

const VARIANT_CLASS: Record<AlertVariant, string> = {
  green: "border-[var(--wt-green)] bg-[var(--wt-green-light)] text-[var(--wt-green)]",
  amber: "border-[var(--wt-amber)] bg-[var(--wt-amber-light)] text-[var(--wt-amber)]",
  red:   "border-[var(--wt-red)] bg-[var(--wt-red-light)] text-[var(--wt-red)]",
  blue:  "border-[var(--wt-blue)] bg-[var(--wt-blue-light)] text-[var(--wt-blue)]",
}

interface AlertPanelProps {
  children: ReactNode
  variant: AlertVariant
  /** Leading icon */
  icon?: ReactNode
  /** Bold title line */
  title?: string
  className?: string
}

export function AlertPanel({ children, variant, icon, title, className }: AlertPanelProps) {
  return (
    <div className={cn(
      "rounded-[var(--wt-r-sm)] border p-4 space-y-2",
      VARIANT_CLASS[variant],
      className,
    )}>
      {(icon || title) && (
        <div className="flex items-center gap-2">
          {icon}
          {title && <h4 className="font-medium text-sm">{title}</h4>}
        </div>
      )}
      <div className="text-sm">{children}</div>
    </div>
  )
}
