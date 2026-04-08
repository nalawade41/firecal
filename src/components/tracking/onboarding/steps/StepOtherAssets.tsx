import type { StepProps } from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useStepOtherAssets } from "./hooks/useStepOtherAssets"

export function StepOtherAssets(props: StepProps) {
  const { assets, update } = useStepOtherAssets(props)

  return (
    <div className="space-y-6">
      {/* EPF */}
      <GlassPanel title="EPF (Employee Provident Fund)" className="!p-4 !space-y-3">
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
      </GlassPanel>

      {/* NPS */}
      <GlassPanel title="NPS (National Pension System)" className="!p-4 !space-y-3">
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
      </GlassPanel>

      {/* Gold & Silver */}
      <GlassPanel title="Gold & Silver" className="!p-4 !space-y-3">
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
      </GlassPanel>

      {/* Emergency & Savings */}
      <GlassPanel title="Cash & Savings" className="!p-4 !space-y-3">
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
      </GlassPanel>
    </div>
  )
}
