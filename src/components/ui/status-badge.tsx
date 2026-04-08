import type { ReactNode } from "react"
import { cn } from "@/utils"

type BadgeVariant = "green" | "amber" | "red" | "blue" | "gray" | "glass"
  | "green-dark" | "amber-dark" | "red-dark"

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  green: "wt-badge-green",
  amber: "wt-badge-amber",
  red:   "wt-badge-red",
  blue:  "bg-[var(--wt-blue-light)] text-[var(--wt-blue)]",
  gray:  "wt-badge-gray",
  glass: "wt-badge-glass",
  /** Dark-mode badges for use on dark backgrounds (dashboard tiles) */
  "green-dark": "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  "amber-dark": "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  "red-dark":   "bg-red-500/15 text-red-400 border border-red-500/20",
}

interface StatusBadgeProps {
  children: ReactNode
  variant: BadgeVariant
  /** Optional leading icon */
  icon?: ReactNode
  className?: string
}

export function StatusBadge({ children, variant, icon, className }: StatusBadgeProps) {
  return (
    <span className={cn("wt-badge", VARIANT_CLASS[variant], className)}>
      {icon && <span className="mr-1 flex items-center">{icon}</span>}
      {children}
    </span>
  )
}
