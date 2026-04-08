import { Button } from "@/components/ui/button"
import type { MultiBucketPortfolioViewProps } from "../types/FireTable.types"
import { useMultiBucket } from "../hooks/useMultiBucket"
import { BucketPortfolioTable } from "./BucketPortfolioTable"

export function MultiBucketPortfolioView({ yearByYear, bucketLabels }: MultiBucketPortfolioViewProps) {
  const { selected, setSelected } = useMultiBucket()

  if (bucketLabels.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No portfolios for this category.</p>
  }

  return (
    <div>
      {bucketLabels.length > 1 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {bucketLabels.map((label, i) => (
            <Button
              key={label}
              size="sm"
              variant={selected === i ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setSelected(i)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
      <BucketPortfolioTable yearByYear={yearByYear} bucketLabel={bucketLabels[selected]} />
    </div>
  )
}
