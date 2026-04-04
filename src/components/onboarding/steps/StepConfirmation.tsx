import { Download } from "lucide-react"
import type { StepProps } from "@/types/onboarding"

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

function downloadJSON(data: StepProps["data"]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `firecal-plan-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function StepConfirmation({ data }: StepProps) {
  const goalNames = data.selectedGoals
    .filter((g) => g !== "custom")
    .map((g) => {
      const map: Record<string, string> = {
        fire: "FIRE",
        "school-fees": "School Fees",
        graduation: "Graduation",
        marriage: "Marriage",
        "house-down-payment": "House / Down Payment",
        whitegoods: "Whitegoods",
      }
      return map[g] ?? g
    })

  const customNames = data.customGoalDefinitions.map((d) => d.name)
  const allGoalNames = [...goalNames, ...customNames]

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
        <h4 className="text-sm font-bold text-slate-800 mb-2">Profile</h4>
        <SummaryRow label="Current Age" value={data.profile.currentAge} />
        <SummaryRow label="Retirement Age" value={data.profile.retirementAge} />
        <SummaryRow label="Life Expectancy" value={data.profile.lifeExpectancy} />
        <SummaryRow label="Children" value={data.profile.numberOfChildren} />
        <SummaryRow label="Annual Expense" value={`₹${data.expenses.annualHouseholdExpense.toLocaleString("en-IN")}`} />
      </div>

      {/* Goals */}
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
        <h4 className="text-sm font-bold text-slate-800 mb-2">Goals</h4>
        <SummaryRow label="Total Goals" value={allGoalNames.length} />
        <SummaryRow label="Goal Names" value={allGoalNames.join(", ") || "None"} />
      </div>

      {/* Investments */}
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
        <h4 className="text-sm font-bold text-slate-800 mb-2">Investments</h4>
        <SummaryRow label="Lumpsum Investments" value={data.lumpsumInvestments.length} />
        <SummaryRow label="Active SIPs" value={data.sipInvestments.length} />
      </div>

      {/* Other Assets */}
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
        <h4 className="text-sm font-bold text-slate-800 mb-2">Other Assets</h4>
        <SummaryRow label="EPF Balance" value={`₹${data.otherAssets.epf.currentBalance.toLocaleString("en-IN")}`} />
        <SummaryRow label="NPS Balance" value={`₹${data.otherAssets.nps.currentBalance.toLocaleString("en-IN")}`} />
        <SummaryRow label="Gold" value={`${data.otherAssets.goldGrams}g`} />
        <SummaryRow label="Silver" value={`${data.otherAssets.silverGrams}g`} />
        <SummaryRow label="Emergency Fund" value={`₹${data.otherAssets.emergencyFund.toLocaleString("en-IN")}`} />
        <SummaryRow label="Other Savings" value={`₹${data.otherAssets.otherSavings.toLocaleString("en-IN")}`} />
      </div>

      {/* Download backup */}
      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/60 space-y-3">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">Save your plan</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Download a backup of all the data you entered. Next time you visit, upload this file to skip onboarding — your data will be pre-filled so you can just review and go.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadJSON(data)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Backup (JSON)
        </button>
      </div>
    </div>
  )
}
