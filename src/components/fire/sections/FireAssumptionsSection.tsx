import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import type { FireAssumptionsSectionProps } from "../types/FireForm.types"

export function FireAssumptionsSection({ data, update }: FireAssumptionsSectionProps) {
  return (
    <SectionCard title="FIRE & Return Assumptions" description="Withdrawal rate, returns, and glidepath">
      <NumberField
        label="Safe Withdrawal Rate"
        value={data.safeWithdrawalRatePercent}
        onChange={(v) => update("safeWithdrawalRatePercent", v)}
        suffix="%"
        step={0.25}
      />
      <NumberField
        label="Expected Equity Return"
        value={data.expectedEquityReturnPercent}
        onChange={(v) => update("expectedEquityReturnPercent", v)}
        suffix="%"
        step={0.5}
      />
      <NumberField
        label="Expected Debt Return"
        value={data.expectedDebtReturnPercent}
        onChange={(v) => update("expectedDebtReturnPercent", v)}
        suffix="%"
        step={0.5}
      />
    </SectionCard>
  )
}
