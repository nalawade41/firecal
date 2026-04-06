import type {
  FireInputs,
  ChildProfile,
  WhitegoodsItem,
  GlidepathCheckpoint,
  GoalInvestmentProfile,
} from "@/types"

export interface InputFormProps {
  initialInputs: FireInputs
  onCalculate: (inputs: FireInputs) => void
}

export interface UseInputFormReturn {
  inputs: FireInputs
  updateBase: <K extends keyof FireInputs["baseProfile"]>(key: K, value: FireInputs["baseProfile"][K]) => void
  updateExpense: <K extends keyof FireInputs["expenseProfile"]>(key: K, value: FireInputs["expenseProfile"][K]) => void
  updateInvestment: <K extends keyof FireInputs["investmentProfile"]>(key: K, value: FireInputs["investmentProfile"][K]) => void
  updateChild: <K extends keyof ChildProfile>(index: number, key: K, value: ChildProfile[K]) => void
  addChild: () => void
  removeChild: (index: number) => void
  updateEducation: (stage: "school" | "graduation" | "postGraduation", key: string, value: number) => void
  updateMarriage: <K extends keyof FireInputs["marriageParameters"]>(key: K, value: FireInputs["marriageParameters"][K]) => void
  updateWhitegood: <K extends keyof WhitegoodsItem>(index: number, key: K, value: WhitegoodsItem[K]) => void
  addWhitegood: () => void
  removeWhitegood: (index: number) => void
  updateTravel: <K extends keyof FireInputs["travelParameters"]>(key: K, value: FireInputs["travelParameters"][K]) => void
  updateHealthcare: <K extends keyof FireInputs["healthcareParameters"]>(key: K, value: FireInputs["healthcareParameters"][K]) => void
  updateFireAssumptions: <K extends keyof FireInputs["fireAssumptions"]>(key: K, value: FireInputs["fireAssumptions"][K]) => void
  updateGoalInvestment: <K extends keyof GoalInvestmentProfile>(key: K, value: GoalInvestmentProfile[K]) => void
  updateGlidepath: (index: number, key: keyof GlidepathCheckpoint, value: number) => void
  addGlidepointCheckpoint: () => void
  removeGlidepointCheckpoint: (index: number) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleExport: () => void
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCalculate: () => void
}

// ── Section Props ──────────────────────────────────────────

export interface BaseProfileSectionProps {
  data: FireInputs["baseProfile"]
  update: UseInputFormReturn["updateBase"]
}

export interface ExpenseProfileSectionProps {
  data: FireInputs["expenseProfile"]
  update: UseInputFormReturn["updateExpense"]
}

export interface InvestmentProfileSectionProps {
  data: FireInputs["investmentProfile"]
  update: UseInputFormReturn["updateInvestment"]
}

export interface ChildrenSectionProps {
  children: FireInputs["children"]
  updateChild: UseInputFormReturn["updateChild"]
  addChild: UseInputFormReturn["addChild"]
  removeChild: UseInputFormReturn["removeChild"]
}

export interface EducationSectionProps {
  data: FireInputs["educationParameters"]
  update: UseInputFormReturn["updateEducation"]
}

export interface MarriageSectionProps {
  data: FireInputs["marriageParameters"]
  update: UseInputFormReturn["updateMarriage"]
}

export interface WhitegoodsSectionProps {
  items: FireInputs["whitegoods"]
  updateWhitegood: UseInputFormReturn["updateWhitegood"]
  addWhitegood: UseInputFormReturn["addWhitegood"]
  removeWhitegood: UseInputFormReturn["removeWhitegood"]
}

export interface TravelSectionProps {
  data: FireInputs["travelParameters"]
  update: UseInputFormReturn["updateTravel"]
}

export interface HealthcareSectionProps {
  data: FireInputs["healthcareParameters"]
  update: UseInputFormReturn["updateHealthcare"]
}

export interface FireAssumptionsSectionProps {
  data: FireInputs["fireAssumptions"]
  update: UseInputFormReturn["updateFireAssumptions"]
}

export interface GoalInvestmentSectionProps {
  data: GoalInvestmentProfile
  update: UseInputFormReturn["updateGoalInvestment"]
}

export interface GlidepathSectionProps {
  checkpoints: GlidepathCheckpoint[]
  updateGlidepath: UseInputFormReturn["updateGlidepath"]
  addCheckpoint: UseInputFormReturn["addGlidepointCheckpoint"]
  removeCheckpoint: UseInputFormReturn["removeGlidepointCheckpoint"]
}

export interface ActionButtonsSectionProps {
  fileInputRef: UseInputFormReturn["fileInputRef"]
  handleExport: UseInputFormReturn["handleExport"]
  handleImport: UseInputFormReturn["handleImport"]
  handleCalculate: UseInputFormReturn["handleCalculate"]
}
