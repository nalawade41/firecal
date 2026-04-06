import { formatINR } from "@/lib/utils"
import type { BucketCardProps } from "../types/ResultsSummary.types"
import { Row } from "./Row"

export function BucketCard({ bucket }: BucketCardProps) {
  return (
    <div className="rounded-lg border border-white/50 bg-white/30 p-4 space-y-2 text-sm">
      <div>
        <p className="font-semibold text-sm">{bucket.label}</p>
        <p className="text-xs text-muted-foreground">{bucket.sublabel}</p>
      </div>
      <Row label="Today's Cost" value={formatINR(bucket.presentCost)} />
      <Row label="Future Cost (inflated)" value={formatINR(bucket.futureCost)} />
      <Row label="Years to Goal" value={String(bucket.yearsToGoal)} />
      <Row label={`Expected Return`} value={`${bucket.expectedReturnPercent.toFixed(1)}%`} />
      <div className="h-px bg-border/40" />
      <Row label="Lumpsum Today" value={formatINR(bucket.lumpsumToday)} />
      <Row label="Monthly SIP" value={formatINR(bucket.monthlySip)} bold />
    </div>
  )
}
