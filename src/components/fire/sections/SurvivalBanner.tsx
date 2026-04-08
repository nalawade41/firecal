import { CheckCircle, AlertTriangle } from "lucide-react"
import { formatINR } from "@/utils"
import { AlertPanel } from "@/components/ui/alert-panel"
import { MoneyValue } from "@/components/ui/money-value"

import type { SurvivalBannerProps } from "../types/FireSummary.types"

export function SurvivalBanner({ survived, finalBalance, depletionAge, depletionYear }: SurvivalBannerProps) {
  return (
    <AlertPanel
      variant={survived ? "green" : "red"}
      icon={survived
        ? <CheckCircle className="h-10 w-10" />
        : <AlertTriangle className="h-10 w-10" />
      }
      title={survived ? "Portfolio Survived!" : "Portfolio Depleted"}
      className="p-6"
    >
      <p>
        {survived
          ? <>Final balance: <MoneyValue>{formatINR(finalBalance)}</MoneyValue></>
          : `Depleted at age ${depletionAge} (${depletionYear})`}
      </p>
    </AlertPanel>
  )
}
