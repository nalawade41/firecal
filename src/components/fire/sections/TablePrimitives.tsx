import { cn } from "@/utils"
import { StatusBadge as StatusBadgeUI } from "@/components/ui/status-badge"

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--wt-divider)]">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2 text-left font-medium text-[var(--wt-ink2)] bg-[var(--wt-mist)] whitespace-nowrap", className)}>
      {children}
    </th>
  )
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-3 py-2 whitespace-nowrap text-[var(--wt-ink)]", className)}>
      {children}
    </td>
  )
}

export function StatusBadge({ isRetired }: { isRetired: boolean }) {
  return (
    <StatusBadgeUI variant={isRetired ? "amber" : "blue"}>
      {isRetired ? "Retired" : "Working"}
    </StatusBadgeUI>
  )
}
