import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertPanel } from "@/components/ui/alert-panel"
import type { StepProps } from "@/types/onboarding"
import { useStepConfirmation } from "./hooks/useStepConfirmation"

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[var(--wt-divider)] last:border-0">
      <span className="text-sm text-[var(--wt-ink2)]">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

export function StepConfirmation(props: StepProps) {
  const { data } = props
  const { allGoalNames, downloadJSON } = useStepConfirmation(props)

  return (
    <div className="space-y-6">
      {/* Profile */}
      <GlassPanel title="Profile" className="!p-4 !space-y-1">
        <SummaryRow label="Current Age" value={data.profile.currentAge} />
        <SummaryRow label="Retirement Age" value={data.profile.retirementAge} />
        <SummaryRow label="Life Expectancy" value={data.profile.lifeExpectancy} />
        <SummaryRow label="Children" value={data.profile.numberOfChildren} />
        <SummaryRow label="Annual Expense" value={`₹${data.expenses.annualHouseholdExpense.toLocaleString("en-IN")}`} />
      </GlassPanel>

      {/* Goals */}
      <GlassPanel title="Goals" className="!p-4 !space-y-1">
        <SummaryRow label="Total Goals" value={allGoalNames.length} />
        <SummaryRow label="Goal Names" value={allGoalNames.join(", ") || "None"} />
      </GlassPanel>

      {/* Investments */}
      <GlassPanel title="Investments" className="!p-4 !space-y-1">
        <SummaryRow label="Lumpsum Investments" value={data.lumpsumInvestments.length} />
        <SummaryRow label="Active SIPs" value={data.sipInvestments.length} />
      </GlassPanel>

      {/* Other Assets */}
      <GlassPanel title="Other Assets" className="!p-4 !space-y-1">
        <SummaryRow label="EPF Balance" value={`₹${data.otherAssets.epf.currentBalance.toLocaleString("en-IN")}`} />
        <SummaryRow label="NPS Balance" value={`₹${data.otherAssets.nps.currentBalance.toLocaleString("en-IN")}`} />
        <SummaryRow label="Gold" value={`${data.otherAssets.goldGrams}g`} />
        <SummaryRow label="Silver" value={`${data.otherAssets.silverGrams}g`} />
        <SummaryRow label="Emergency Fund" value={`₹${data.otherAssets.emergencyFund.toLocaleString("en-IN")}`} />
        <SummaryRow label="Other Savings" value={`₹${data.otherAssets.otherSavings.toLocaleString("en-IN")}`} />
      </GlassPanel>

      {/* Download backup */}
      <AlertPanel variant="blue" title="Save your plan">
        <p className="text-xs leading-relaxed">
          Download a backup of all the data you entered. Next time you visit, upload this file to skip onboarding — your data will be pre-filled so you can just review and go.
        </p>
        <Button
          type="button"
          onClick={() => downloadJSON()}
          className="mt-2 bg-[var(--wt-blue)] text-white hover:bg-[var(--wt-blue)]/90"
        >
          <Download className="h-4 w-4" />
          Download Backup (JSON)
        </Button>
      </AlertPanel>
    </div>
  )
}
