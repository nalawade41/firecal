import type { ReactNode } from "react"

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}
