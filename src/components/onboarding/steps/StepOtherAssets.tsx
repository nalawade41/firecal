import type { StepProps } from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"
import { useStepOtherAssets } from "./hooks/useStepOtherAssets"

export function StepOtherAssets(props: StepProps) {
  const { assets, update } = useStepOtherAssets(props)

  return (
    <div className="space-y-6">
      {/* EPF */}
      <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
        <h4 className="text-sm font-bold text-slate-800">EPF (Employee Provident Fund)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberField
            label="Current Balance"
            value={assets.epf.currentBalance}
            onChange={(v) => update({ epf: { ...assets.epf, currentBalance: v } })}
            suffix="₹"
          />
          <NumberField
            label="Monthly Contribution"
            value={assets.epf.monthlyContribution}
            onChange={(v) => update({ epf: { ...assets.epf, monthlyContribution: v } })}
            suffix="₹"
          />
          <NumberField
            label="Years to Continue"
            value={assets.epf.yearsToContinue}
            onChange={(v) => update({ epf: { ...assets.epf, yearsToContinue: v } })}
          />
        </div>
      </div>

      {/* NPS */}
      <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
        <h4 className="text-sm font-bold text-slate-800">NPS (National Pension System)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberField
            label="Current Balance"
            value={assets.nps.currentBalance}
            onChange={(v) => update({ nps: { ...assets.nps, currentBalance: v } })}
            suffix="₹"
          />
          <NumberField
            label="Yearly Contribution"
            value={assets.nps.yearlyContribution}
            onChange={(v) => update({ nps: { ...assets.nps, yearlyContribution: v } })}
            suffix="₹"
          />
          <NumberField
            label="Years to Continue"
            value={assets.nps.yearsToContinue}
            onChange={(v) => update({ nps: { ...assets.nps, yearsToContinue: v } })}
          />
        </div>
      </div>

      {/* Gold & Silver */}
      <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
        <h4 className="text-sm font-bold text-slate-800">Gold & Silver</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField
            label="Gold Held"
            value={assets.goldGrams}
            onChange={(v) => update({ goldGrams: v })}
            suffix="grams"
            step={0.1}
          />
          <NumberField
            label="Silver Held"
            value={assets.silverGrams}
            onChange={(v) => update({ silverGrams: v })}
            suffix="grams"
            step={1}
          />
        </div>
      </div>

      {/* Emergency & Savings */}
      <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
        <h4 className="text-sm font-bold text-slate-800">Cash & Savings</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField
            label="Emergency Fund"
            value={assets.emergencyFund}
            onChange={(v) => update({ emergencyFund: v })}
            suffix="₹"
          />
          <NumberField
            label="Other Savings / Cash"
            value={assets.otherSavings}
            onChange={(v) => update({ otherSavings: v })}
            suffix="₹"
          />
        </div>
      </div>
    </div>
  )
}
