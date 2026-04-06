import type { InputFormProps } from "./types/InputForm.types"
import { useInputForm } from "./hooks/useInputForm"
import { BaseProfileSection } from "./sections/BaseProfileSection"
import { ExpenseProfileSection } from "./sections/ExpenseProfileSection"
import { InvestmentProfileSection } from "./sections/InvestmentProfileSection"
import { ChildrenSection } from "./sections/ChildrenSection"
import { EducationSection } from "./sections/EducationSection"
import { MarriageSection } from "./sections/MarriageSection"
import { WhitegoodsSection } from "./sections/WhitegoodsSection"
import { TravelSection } from "./sections/TravelSection"
import { HealthcareSection } from "./sections/HealthcareSection"
import { FireAssumptionsSection } from "./sections/FireAssumptionsSection"
import { GoalInvestmentSection } from "./sections/GoalInvestmentSection"
import { GlidepathSection } from "./sections/GlidepathSection"
import { ActionButtonsSection } from "./sections/ActionButtonsSection"

export function InputForm(props: InputFormProps) {
  const {
    inputs,
    updateBase, updateExpense, updateInvestment,
    updateChild, addChild, removeChild,
    updateEducation, updateMarriage,
    updateWhitegood, addWhitegood, removeWhitegood,
    updateTravel, updateHealthcare,
    updateFireAssumptions, updateGoalInvestment,
    updateGlidepath, addGlidepointCheckpoint, removeGlidepointCheckpoint,
    fileInputRef, handleExport, handleImport, handleCalculate,
  } = useInputForm(props)

  return (
    <div className="space-y-6">
      <BaseProfileSection data={inputs.baseProfile} update={updateBase} />
      <ExpenseProfileSection data={inputs.expenseProfile} update={updateExpense} />
      <InvestmentProfileSection data={inputs.investmentProfile} update={updateInvestment} />
      <ChildrenSection children={inputs.children} updateChild={updateChild} addChild={addChild} removeChild={removeChild} />
      <EducationSection data={inputs.educationParameters} update={updateEducation} />
      <MarriageSection data={inputs.marriageParameters} update={updateMarriage} />
      <WhitegoodsSection items={inputs.whitegoods} updateWhitegood={updateWhitegood} addWhitegood={addWhitegood} removeWhitegood={removeWhitegood} />
      <TravelSection data={inputs.travelParameters} update={updateTravel} />
      <HealthcareSection data={inputs.healthcareParameters} update={updateHealthcare} />
      <FireAssumptionsSection data={inputs.fireAssumptions} update={updateFireAssumptions} />
      <GoalInvestmentSection data={inputs.fireAssumptions.goalInvestment} update={updateGoalInvestment} />
      <GlidepathSection checkpoints={inputs.fireAssumptions.glidepathCheckpoints} updateGlidepath={updateGlidepath} addCheckpoint={addGlidepointCheckpoint} removeCheckpoint={removeGlidepointCheckpoint} />
      <ActionButtonsSection fileInputRef={fileInputRef} handleExport={handleExport} handleImport={handleImport} handleCalculate={handleCalculate} />
    </div>
  )
}
