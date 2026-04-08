import { AlertTriangle } from "lucide-react"
import { AlertPanel } from "@/components/ui/alert-panel"

import type { WarningsPanelProps } from "../types/TaxHarvestResults.types"

export function WarningsPanel({ warnings }: WarningsPanelProps) {
  if (warnings.length === 0) return null

  return (
    <AlertPanel variant="amber" icon={<AlertTriangle className="h-5 w-5" />} title="Warnings">
      <ul className="space-y-1">
        {warnings.map((warning, idx) => (
          <li key={idx}>&bull; {warning}</li>
        ))}
      </ul>
    </AlertPanel>
  )
}
