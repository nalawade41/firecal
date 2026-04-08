import type { ReactNode } from "react"
import { cn } from "@/utils"

type GlassVariant = "light" | "dark" | "pine" | "subtle"

const VARIANT_CLASS: Record<GlassVariant, string> = {
  light:  "wt-glass",
  dark:   "wt-glass-dark",
  pine:   "wt-glass-pine",
  /** Subtle dark-on-dark glass for dashboard tiles on dark backgrounds */
  subtle: "rounded-[var(--wt-r-lg)] bg-white/[0.07] backdrop-blur-sm border border-white/10",
}

interface GlassPanelProps {
  children: ReactNode
  variant?: GlassVariant
  className?: string
  /** Section title rendered as h3 */
  title?: string
  /** Subtitle rendered below the title */
  description?: string
  /** Optional content rendered to the right of the title row (buttons, badges, etc.) */
  headerAction?: ReactNode
}

export function GlassPanel({
  children,
  variant = "light",
  className,
  title,
  description,
  headerAction,
}: GlassPanelProps) {
  return (
    <div className={cn(VARIANT_CLASS[variant], "p-6 space-y-4", className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className={cn(
                "text-lg font-medium tracking-tight",
                (variant === "pine" || variant === "subtle") ? "text-white" : "text-[var(--wt-ink)]"
              )}>
                {title}
              </h3>
            )}
            {description && (
              <p className={cn(
                "text-sm mt-0.5",
                (variant === "pine" || variant === "subtle") ? "text-white/70" : "text-[var(--wt-ink2)]"
              )}>
                {description}
              </p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  )
}
