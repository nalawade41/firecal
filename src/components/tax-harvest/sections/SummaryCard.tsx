import { StatBox } from "@/components/ui/stat-box"

import type { SummaryCardColor } from "../types/TaxHarvestResults.types"

interface SummaryCardProps {
  title: string
  value: string
  subtext: string
  color: SummaryCardColor
}

export function SummaryCard({ title, value, subtext, color }: SummaryCardProps) {
  return (
    <StatBox label={title} value={value} subtext={subtext} color={color} size="lg" />
  )
}
