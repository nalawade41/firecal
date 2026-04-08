import { ChevronDown, ChevronUp } from "lucide-react"
import { formatINR } from "@/utils"
import type { CategorySectionProps } from "../types/FireSummary.types"
import { useCategorySection } from "../hooks/useCategorySection"
import { BucketCard } from "./BucketCard"

export function CategorySection({ cat, icon }: CategorySectionProps) {
  const { expanded, toggle } = useCategorySection()

  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="font-semibold">{cat.label}</p>
            <p className="text-xs text-muted-foreground">
              {cat.buckets.length} goal{cat.buckets.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Future Cost</p>
            <p className="font-medium">{formatINR(cat.totalFutureCost)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Lumpsum</p>
            <p className="font-medium">{formatINR(cat.totalLumpsumToday)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Monthly SIP</p>
            <p className="font-bold text-primary">{formatINR(cat.totalMonthlySip)}</p>
          </div>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <div className={`grid gap-3 ${cat.buckets.length > 1 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-md"}`}>
            {cat.buckets.map((bucket, i) => (
              <BucketCard key={i} bucket={bucket} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
