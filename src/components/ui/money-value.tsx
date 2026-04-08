import { cn } from "@/utils"

interface MoneyValueProps {
  /** The already-formatted string (from formatINR, formatUnits, etc.) */
  children: string
  className?: string
  /** Optional color override — defaults to inherit */
  color?: "green" | "amber" | "red" | "blue" | "inherit"
}

const COLOR_CLASS: Record<string, string> = {
  green:   "text-[var(--wt-green)]",
  amber:   "text-[var(--wt-amber)]",
  red:     "text-[var(--wt-red)]",
  blue:    "text-[var(--wt-blue)]",
  inherit: "",
}

export function MoneyValue({ children, className, color = "inherit" }: MoneyValueProps) {
  return (
    <span className={cn("font-['DM_Mono',monospace]", COLOR_CLASS[color], className)}>
      {children}
    </span>
  )
}
