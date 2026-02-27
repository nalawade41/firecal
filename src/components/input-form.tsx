import { useState, useRef } from "react"
import type {
  FireInputs,
  ChildProfile,
  WhitegoodsItem,
  GlidepathCheckpoint,
  GoalInvestmentProfile,
} from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SectionCard } from "@/components/ui/section-card"
import { NumberField } from "@/components/ui/number-field"
import { Plus, Trash2, Calculator, Download, Upload } from "lucide-react"

interface InputFormProps {
  initialInputs: FireInputs
  onCalculate: (inputs: FireInputs) => void
}

export function InputForm({ initialInputs, onCalculate }: InputFormProps) {
  const [inputs, setInputs] = useState<FireInputs>(initialInputs)

  function updateBase<K extends keyof FireInputs["baseProfile"]>(
    key: K,
    value: FireInputs["baseProfile"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      baseProfile: { ...prev.baseProfile, [key]: value },
    }))
  }

  function updateExpense<K extends keyof FireInputs["expenseProfile"]>(
    key: K,
    value: FireInputs["expenseProfile"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      expenseProfile: { ...prev.expenseProfile, [key]: value },
    }))
  }

  function updateInvestment<K extends keyof FireInputs["investmentProfile"]>(
    key: K,
    value: FireInputs["investmentProfile"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      investmentProfile: { ...prev.investmentProfile, [key]: value },
    }))
  }

  function updateChild<K extends keyof ChildProfile>(
    index: number,
    key: K,
    value: ChildProfile[K]
  ) {
    setInputs((prev) => {
      const children = [...prev.children]
      children[index] = { ...children[index], [key]: value }
      return { ...prev, children }
    })
  }

  function addChild() {
    if (inputs.children.length >= 5) return
    setInputs((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          currentAge: 0,
          schoolStartAge: 4,
          graduationStartAge: 18,
          postGraduationStartAge: 22,
          marriageAge: 28,
        },
      ],
      baseProfile: {
        ...prev.baseProfile,
        numberOfKids: prev.children.length + 1,
      },
    }))
  }

  function removeChild(index: number) {
    setInputs((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
      baseProfile: {
        ...prev.baseProfile,
        numberOfKids: prev.children.length - 1,
      },
    }))
  }

  function updateEducation(
    stage: "school" | "graduation" | "postGraduation",
    key: string,
    value: number
  ) {
    setInputs((prev) => ({
      ...prev,
      educationParameters: {
        ...prev.educationParameters,
        [stage]: { ...prev.educationParameters[stage], [key]: value },
      },
    }))
  }

  function updateMarriage<K extends keyof FireInputs["marriageParameters"]>(
    key: K,
    value: FireInputs["marriageParameters"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      marriageParameters: { ...prev.marriageParameters, [key]: value },
    }))
  }

  function updateWhitegood<K extends keyof WhitegoodsItem>(
    index: number,
    key: K,
    value: WhitegoodsItem[K]
  ) {
    setInputs((prev) => {
      const whitegoods = [...prev.whitegoods]
      whitegoods[index] = { ...whitegoods[index], [key]: value }
      return { ...prev, whitegoods }
    })
  }

  function addWhitegood() {
    setInputs((prev) => ({
      ...prev,
      whitegoods: [
        ...prev.whitegoods,
        {
          itemName: "New Item",
          currentCost: 100000,
          replacementFrequencyYears: 5,
          inflationPercent: 6,
        },
      ],
    }))
  }

  function removeWhitegood(index: number) {
    setInputs((prev) => ({
      ...prev,
      whitegoods: prev.whitegoods.filter((_, i) => i !== index),
    }))
  }

  function updateTravel<K extends keyof FireInputs["travelParameters"]>(
    key: K,
    value: FireInputs["travelParameters"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      travelParameters: { ...prev.travelParameters, [key]: value },
    }))
  }

  function updateHealthcare<K extends keyof FireInputs["healthcareParameters"]>(
    key: K,
    value: FireInputs["healthcareParameters"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      healthcareParameters: { ...prev.healthcareParameters, [key]: value },
    }))
  }

  function updateFireAssumptions<K extends keyof FireInputs["fireAssumptions"]>(
    key: K,
    value: FireInputs["fireAssumptions"][K]
  ) {
    setInputs((prev) => ({
      ...prev,
      fireAssumptions: { ...prev.fireAssumptions, [key]: value },
    }))
  }

  function updateGoalInvestment<K extends keyof GoalInvestmentProfile>(
    key: K,
    value: GoalInvestmentProfile[K]
  ) {
    setInputs((prev) => ({
      ...prev,
      fireAssumptions: {
        ...prev.fireAssumptions,
        goalInvestment: { ...prev.fireAssumptions.goalInvestment, [key]: value },
      },
    }))
  }

  function updateGlidepath(index: number, key: keyof GlidepathCheckpoint, value: number) {
    setInputs((prev) => {
      const checkpoints = [...prev.fireAssumptions.glidepathCheckpoints]
      checkpoints[index] = { ...checkpoints[index], [key]: value }
      return {
        ...prev,
        fireAssumptions: { ...prev.fireAssumptions, glidepathCheckpoints: checkpoints },
      }
    })
  }

  function addGlidepointCheckpoint() {
    setInputs((prev) => ({
      ...prev,
      fireAssumptions: {
        ...prev.fireAssumptions,
        glidepathCheckpoints: [
          ...prev.fireAssumptions.glidepathCheckpoints,
          { age: 50, equityPercent: 50 },
        ],
      },
    }))
  }

  function removeGlidepointCheckpoint(index: number) {
    setInputs((prev) => ({
      ...prev,
      fireAssumptions: {
        ...prev.fireAssumptions,
        glidepathCheckpoints: prev.fireAssumptions.glidepathCheckpoints.filter(
          (_, i) => i !== index
        ),
      },
    }))
  }

  // ─── Export / Import ────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const json = JSON.stringify(inputs, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `firecal-inputs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const parsed = JSON.parse(raw) as FireInputs
        setInputs(parsed)
      } catch {
        alert("Invalid JSON file. Please select a valid FireCal export.")
      }
    }
    reader.readAsText(file)
    // Reset so re-importing the same file triggers onChange
    e.target.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Base Profile */}
      <SectionCard title="Base Profile" description="Your age and retirement timeline">
        <NumberField
          label="Current Year"
          value={inputs.baseProfile.currentYear}
          onChange={(v) => updateBase("currentYear", v)}
        />
        <NumberField
          label="Current Age"
          value={inputs.baseProfile.currentAge}
          onChange={(v) => updateBase("currentAge", v)}
          min={18}
          max={100}
        />
        <NumberField
          label="Retirement Age"
          value={inputs.baseProfile.retirementAge}
          onChange={(v) => updateBase("retirementAge", v)}
          min={30}
          max={100}
        />
        <NumberField
          label="Life Expectancy Age"
          value={inputs.baseProfile.lifeExpectancyAge}
          onChange={(v) => updateBase("lifeExpectancyAge", v)}
          min={50}
          max={120}
        />
      </SectionCard>

      {/* Expense Profile */}
      <SectionCard title="Expense Profile" description="Annual household expenses and inflation">
        <NumberField
          label="Annual Household Expense"
          value={inputs.expenseProfile.currentAnnualHouseholdExpense}
          onChange={(v) => updateExpense("currentAnnualHouseholdExpense", v)}
          suffix="₹"
        />
        <NumberField
          label="Expense Inflation"
          value={inputs.expenseProfile.expenseInflationPercent}
          onChange={(v) => updateExpense("expenseInflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Retirement Adjustment Factor"
          value={inputs.expenseProfile.expenseAdjustmentFactorAtRetirement}
          onChange={(v) => updateExpense("expenseAdjustmentFactorAtRetirement", v)}
          step={0.05}
          min={0.1}
          max={1.5}
        />
      </SectionCard>

      {/* Investment Profile */}
      <SectionCard title="Investment Profile" description="Portfolio and annual savings">
        <NumberField
          label="Current Portfolio Value"
          value={inputs.investmentProfile.currentPortfolioValue}
          onChange={(v) => updateInvestment("currentPortfolioValue", v)}
          suffix="₹"
        />
        <NumberField
          label="Annual Savings"
          value={inputs.investmentProfile.annualSavings}
          onChange={(v) => updateInvestment("annualSavings", v)}
          suffix="₹"
        />
        <NumberField
          label="Annual Savings Increase"
          value={inputs.investmentProfile.annualSavingsIncreasePercent}
          onChange={(v) => updateInvestment("annualSavingsIncreasePercent", v)}
          suffix="%"
          step={0.5}
        />
      </SectionCard>

      {/* Children */}
      <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Children</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Up to 5 children with milestone ages
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addChild}
            disabled={inputs.children.length >= 5}
            className="bg-white/60"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Child
          </Button>
        </div>
        {inputs.children.map((child, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Child {idx + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeChild(idx)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <NumberField
                label="Current Age"
                value={child.currentAge}
                onChange={(v) => updateChild(idx, "currentAge", v)}
                min={0}
              />
              <NumberField
                label="School Start"
                value={child.schoolStartAge}
                onChange={(v) => updateChild(idx, "schoolStartAge", v)}
                min={3}
              />
              <NumberField
                label="Graduation Start"
                value={child.graduationStartAge}
                onChange={(v) => updateChild(idx, "graduationStartAge", v)}
              />
              <NumberField
                label="PG Start"
                value={child.postGraduationStartAge}
                onChange={(v) => updateChild(idx, "postGraduationStartAge", v)}
              />
              <NumberField
                label="Marriage Age"
                value={child.marriageAge}
                onChange={(v) => updateChild(idx, "marriageAge", v)}
              />
            </div>
            {idx < inputs.children.length - 1 && <Separator className="bg-border/50" />}
          </div>
        ))}
        {inputs.children.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No children added. Click "Add Child" to include education and marriage planning.
          </p>
        )}
      </div>

      {/* Education Parameters */}
      <SectionCard title="Education — School" description="Annual school fee, shared across children">
        <NumberField
          label="Current Annual Fee"
          value={inputs.educationParameters.school.currentAnnualFee}
          onChange={(v) => updateEducation("school", "currentAnnualFee", v)}
          suffix="₹"
        />
        <NumberField
          label="School Inflation"
          value={inputs.educationParameters.school.inflationPercent}
          onChange={(v) => updateEducation("school", "inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Duration"
          value={inputs.educationParameters.school.durationYears}
          onChange={(v) => updateEducation("school", "durationYears", v)}
          suffix="years"
        />
      </SectionCard>

      <SectionCard title="Education — Graduation" description="Total graduation cost spread over duration">
        <NumberField
          label="Total Cost"
          value={inputs.educationParameters.graduation.currentTotalCost}
          onChange={(v) => updateEducation("graduation", "currentTotalCost", v)}
          suffix="₹"
        />
        <NumberField
          label="Graduation Inflation"
          value={inputs.educationParameters.graduation.inflationPercent}
          onChange={(v) => updateEducation("graduation", "inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Duration"
          value={inputs.educationParameters.graduation.durationYears}
          onChange={(v) => updateEducation("graduation", "durationYears", v)}
          suffix="years"
        />
      </SectionCard>

      <SectionCard title="Education — Post Graduation" description="Total PG cost spread over duration">
        <NumberField
          label="Total Cost"
          value={inputs.educationParameters.postGraduation.currentTotalCost}
          onChange={(v) => updateEducation("postGraduation", "currentTotalCost", v)}
          suffix="₹"
        />
        <NumberField
          label="PG Inflation"
          value={inputs.educationParameters.postGraduation.inflationPercent}
          onChange={(v) => updateEducation("postGraduation", "inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Duration"
          value={inputs.educationParameters.postGraduation.durationYears}
          onChange={(v) => updateEducation("postGraduation", "durationYears", v)}
          suffix="years"
        />
      </SectionCard>

      {/* Marriage */}
      <SectionCard title="Marriage" description="Per-child marriage cost">
        <NumberField
          label="Cost Per Child"
          value={inputs.marriageParameters.currentCostPerChild}
          onChange={(v) => updateMarriage("currentCostPerChild", v)}
          suffix="₹"
        />
        <NumberField
          label="Marriage Inflation"
          value={inputs.marriageParameters.inflationPercent}
          onChange={(v) => updateMarriage("inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
      </SectionCard>

      {/* Whitegoods */}
      <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Whitegoods & Replacements</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Items replaced periodically
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addWhitegood} className="bg-white/60">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
        {inputs.whitegoods.map((item, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 flex-1 mr-3">
                <Label className="text-sm font-medium text-foreground/80">Item Name</Label>
                <Input
                  value={item.itemName}
                  onChange={(e) => updateWhitegood(idx, "itemName", e.target.value)}
                  className="bg-white/60 backdrop-blur-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeWhitegood(idx)}
                className="text-destructive hover:text-destructive mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="Current Cost"
                value={item.currentCost}
                onChange={(v) => updateWhitegood(idx, "currentCost", v)}
                suffix="₹"
              />
              <NumberField
                label="Replace Every"
                value={item.replacementFrequencyYears}
                onChange={(v) => updateWhitegood(idx, "replacementFrequencyYears", v)}
                suffix="years"
                min={1}
              />
              <NumberField
                label="Inflation"
                value={item.inflationPercent}
                onChange={(v) => updateWhitegood(idx, "inflationPercent", v)}
                suffix="%"
                step={0.5}
              />
            </div>
            {idx < inputs.whitegoods.length - 1 && <Separator className="bg-border/50" />}
          </div>
        ))}
      </div>

      {/* Travel */}
      <SectionCard title="Travel & Hobbies" description="Annual travel budget">
        <NumberField
          label="Annual Travel Cost"
          value={inputs.travelParameters.currentAnnualCost}
          onChange={(v) => updateTravel("currentAnnualCost", v)}
          suffix="₹"
        />
        <NumberField
          label="Travel Inflation"
          value={inputs.travelParameters.inflationPercent}
          onChange={(v) => updateTravel("inflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Stop Age"
          value={inputs.travelParameters.stopAge}
          onChange={(v) => updateTravel("stopAge", v)}
        />
      </SectionCard>

      {/* Healthcare */}
      <SectionCard title="Healthcare" description="Medical and insurance expenses">
        <NumberField
          label="Annual Medical Expense"
          value={inputs.healthcareParameters.currentAnnualMedicalExpense}
          onChange={(v) => updateHealthcare("currentAnnualMedicalExpense", v)}
          suffix="₹"
        />
        <NumberField
          label="Medical Inflation"
          value={inputs.healthcareParameters.medicalInflationPercent}
          onChange={(v) => updateHealthcare("medicalInflationPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Insurance Premium"
          value={inputs.healthcareParameters.currentInsurancePremium}
          onChange={(v) => updateHealthcare("currentInsurancePremium", v)}
          suffix="₹"
        />
        <NumberField
          label="Premium Inflation"
          value={inputs.healthcareParameters.insurancePremiumInflationPercent}
          onChange={(v) => updateHealthcare("insurancePremiumInflationPercent", v)}
          suffix="%"
          step={0.5}
        />
      </SectionCard>

      {/* FIRE Assumptions */}
      <SectionCard title="FIRE & Return Assumptions" description="Withdrawal rate, returns, and glidepath">
        <NumberField
          label="Safe Withdrawal Rate"
          value={inputs.fireAssumptions.safeWithdrawalRatePercent}
          onChange={(v) => updateFireAssumptions("safeWithdrawalRatePercent", v)}
          suffix="%"
          step={0.25}
        />
        <NumberField
          label="Expected Equity Return"
          value={inputs.fireAssumptions.expectedEquityReturnPercent}
          onChange={(v) => updateFireAssumptions("expectedEquityReturnPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Expected Debt Return"
          value={inputs.fireAssumptions.expectedDebtReturnPercent}
          onChange={(v) => updateFireAssumptions("expectedDebtReturnPercent", v)}
          suffix="%"
          step={0.5}
        />
      </SectionCard>

      {/* Goal-Based Investment Returns */}
      <SectionCard title="Goal-Based Investment" description="Equity/debt allocation and returns for goal planning (SIP & lumpsum calculations)">
        <NumberField
          label="Equity Allocation"
          value={inputs.fireAssumptions.goalInvestment.equityPercent}
          onChange={(v) => {
            updateGoalInvestment("equityPercent", v)
            updateGoalInvestment("debtPercent", 100 - v)
          }}
          suffix="%"
          min={0}
          max={100}
        />
        <NumberField
          label="Debt Allocation"
          value={inputs.fireAssumptions.goalInvestment.debtPercent}
          onChange={(v) => {
            updateGoalInvestment("debtPercent", v)
            updateGoalInvestment("equityPercent", 100 - v)
          }}
          suffix="%"
          min={0}
          max={100}
        />
        <NumberField
          label="Goal Equity Return"
          value={inputs.fireAssumptions.goalInvestment.equityReturnPercent}
          onChange={(v) => updateGoalInvestment("equityReturnPercent", v)}
          suffix="%"
          step={0.5}
        />
        <NumberField
          label="Goal Debt Return"
          value={inputs.fireAssumptions.goalInvestment.debtReturnPercent}
          onChange={(v) => updateGoalInvestment("debtReturnPercent", v)}
          suffix="%"
          step={0.5}
        />
      </SectionCard>

      {/* Glidepath */}
      <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Glidepath Checkpoints</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Equity allocation by age (linearly interpolated)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addGlidepointCheckpoint} className="bg-white/60">
            <Plus className="h-4 w-4 mr-1" /> Add Checkpoint
          </Button>
        </div>
        {inputs.fireAssumptions.glidepathCheckpoints.map((cp, idx) => (
          <div key={idx} className="flex items-end gap-3">
            <NumberField
              label={`Age ${idx + 1}`}
              value={cp.age}
              onChange={(v) => updateGlidepath(idx, "age", v)}
            />
            <NumberField
              label="Equity %"
              value={cp.equityPercent}
              onChange={(v) => updateGlidepath(idx, "equityPercent", v)}
              suffix="%"
              min={0}
              max={100}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeGlidepointCheckpoint(idx)}
              className="text-destructive hover:text-destructive mb-0.5"
              disabled={inputs.fireAssumptions.glidepathCheckpoints.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 pt-4 flex-wrap">
        <Button
          variant="outline"
          size="lg"
          onClick={handleExport}
          className="text-base"
        >
          <Download className="h-5 w-5 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          className="text-base"
        >
          <Upload className="h-5 w-5 mr-2" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          size="lg"
          onClick={() => onCalculate(inputs)}
          className="px-12 text-base shadow-lg"
        >
          <Calculator className="h-5 w-5 mr-2" />
          Calculate FIRE Plan
        </Button>
      </div>
    </div>
  )
}
