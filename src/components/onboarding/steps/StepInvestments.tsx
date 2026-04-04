import type { StepProps } from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"

export function StepInvestments({ data, updateData }: StepProps) {
  function update<K extends keyof typeof data.investments>(key: K, value: typeof data.investments[K]) {
    updateData({ investments: { ...data.investments, [key]: value } })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberField
          label="MF Portfolio Value"
          value={data.investments.mfPortfolio}
          onChange={(v) => update("mfPortfolio", v)}
          suffix="₹"
        />
        <NumberField
          label="NPS Balance"
          value={data.investments.nps}
          onChange={(v) => update("nps", v)}
          suffix="₹"
        />
        <NumberField
          label="EPF Balance"
          value={data.investments.epf}
          onChange={(v) => update("epf", v)}
          suffix="₹"
        />
        <NumberField
          label="PPF Balance"
          value={data.investments.ppf}
          onChange={(v) => update("ppf", v)}
          suffix="₹"
        />
        <NumberField
          label="Gold"
          value={data.investments.goldGrams}
          onChange={(v) => update("goldGrams", v)}
          suffix="grams"
        />
        <NumberField
          label="Silver"
          value={data.investments.silverGrams}
          onChange={(v) => update("silverGrams", v)}
          suffix="grams"
        />
        <NumberField
          label="Emergency Fund"
          value={data.investments.emergencyFund}
          onChange={(v) => update("emergencyFund", v)}
          suffix="₹"
        />
        <NumberField
          label="Savings Account Balance"
          value={data.investments.savingsAccountBalance}
          onChange={(v) => update("savingsAccountBalance", v)}
          suffix="₹"
        />
        <NumberField
          label="Any Other Amount"
          value={data.investments.otherAmount}
          onChange={(v) => update("otherAmount", v)}
          suffix="₹"
        />
      </div>
      <p className="text-xs text-slate-500">"Any Other Amount" is optional — leave at 0 if not applicable.</p>
    </div>
  )
}
