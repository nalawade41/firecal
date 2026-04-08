import type { ReactNode } from "react"
import { cn } from "@/utils"

type StatColor = "green" | "amber" | "red" | "blue"

const COLOR_CLASS: Record<StatColor, string> = {
  green: "bg-[var(--wt-green-light)] border-[var(--wt-green)] text-[var(--wt-green)]",
  amber: "bg-[var(--wt-amber-light)] border-[var(--wt-amber)] text-[var(--wt-amber)]",
  red:   "bg-[var(--wt-red-light)] border-[var(--wt-red)] text-[var(--wt-red)]",
  blue:  "bg-[var(--wt-blue-light)] border-[var(--wt-blue)] text-[var(--wt-blue)]",
}

interface StatBoxProps {
  /** Small label above the value */
  label: string
  /** Primary display value — typically a formatted number */
  value: ReactNode
  /** Optional secondary line below the value */
  subtext?: ReactNode
  color: StatColor
  className?: string
  /** Use large size for hero stats (bigger padding + text) */
  size?: "sm" | "lg"
}

export function StatBox({ label, value, subtext, color, className, size = "sm" }: StatBoxProps) {
  return (
    <div className={cn(
      "border rounded-[var(--wt-r-sm)]",
      size === "lg" ? "p-4" : "p-3",
      COLOR_CLASS[color],
      className,
    )}>
      <p className="text-xs">{label}</p>
      <p className={cn(
        "font-medium font-['DM_Mono',monospace]",
        size === "lg" ? "text-2xl mt-1" : "text-lg",
      )}>
        {value}
      </p>
      {subtext && <p className="text-xs mt-0.5">{subtext}</p>}
    </div>
  )
}
