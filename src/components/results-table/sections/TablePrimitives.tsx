export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/60">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-left font-medium text-muted-foreground bg-white/50 whitespace-nowrap ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-2 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}

export function StatusBadge({ isRetired }: { isRetired: boolean }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${isRetired ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
      {isRetired ? "Retired" : "Working"}
    </span>
  )
}
