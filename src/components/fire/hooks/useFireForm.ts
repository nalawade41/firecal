import { useState, useRef } from "react"
import type {
  FireInputs,
  ChildProfile,
  WhitegoodsItem,
  GlidepathCheckpoint,
  GoalInvestmentProfile,
} from "@/types"
import type { InputFormProps, UseInputFormReturn } from "../types/FireForm.types"

export function useFireForm({ initialInputs, onCalculate }: InputFormProps): UseInputFormReturn {
  const [inputs, setInputs] = useState<FireInputs>(initialInputs)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function updateBase<K extends keyof FireInputs["baseProfile"]>(key: K, value: FireInputs["baseProfile"][K]) {
    setInputs((prev) => ({ ...prev, baseProfile: { ...prev.baseProfile, [key]: value } }))
  }

  function updateExpense<K extends keyof FireInputs["expenseProfile"]>(key: K, value: FireInputs["expenseProfile"][K]) {
    setInputs((prev) => ({ ...prev, expenseProfile: { ...prev.expenseProfile, [key]: value } }))
  }

  function updateInvestment<K extends keyof FireInputs["investmentProfile"]>(key: K, value: FireInputs["investmentProfile"][K]) {
    setInputs((prev) => ({ ...prev, investmentProfile: { ...prev.investmentProfile, [key]: value } }))
  }

  function updateChild<K extends keyof ChildProfile>(index: number, key: K, value: ChildProfile[K]) {
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
      baseProfile: { ...prev.baseProfile, numberOfKids: prev.children.length + 1 },
    }))
  }

  function removeChild(index: number) {
    setInputs((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
      baseProfile: { ...prev.baseProfile, numberOfKids: prev.children.length - 1 },
    }))
  }

  function updateEducation(stage: "school" | "graduation" | "postGraduation", key: string, value: number) {
    setInputs((prev) => ({
      ...prev,
      educationParameters: {
        ...prev.educationParameters,
        [stage]: { ...prev.educationParameters[stage], [key]: value },
      },
    }))
  }

  function updateMarriage<K extends keyof FireInputs["marriageParameters"]>(key: K, value: FireInputs["marriageParameters"][K]) {
    setInputs((prev) => ({ ...prev, marriageParameters: { ...prev.marriageParameters, [key]: value } }))
  }

  function updateWhitegood<K extends keyof WhitegoodsItem>(index: number, key: K, value: WhitegoodsItem[K]) {
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
        { itemName: "New Item", currentCost: 100000, replacementFrequencyYears: 5, inflationPercent: 6 },
      ],
    }))
  }

  function removeWhitegood(index: number) {
    setInputs((prev) => ({ ...prev, whitegoods: prev.whitegoods.filter((_, i) => i !== index) }))
  }

  function updateTravel<K extends keyof FireInputs["travelParameters"]>(key: K, value: FireInputs["travelParameters"][K]) {
    setInputs((prev) => ({ ...prev, travelParameters: { ...prev.travelParameters, [key]: value } }))
  }

  function updateHealthcare<K extends keyof FireInputs["healthcareParameters"]>(key: K, value: FireInputs["healthcareParameters"][K]) {
    setInputs((prev) => ({ ...prev, healthcareParameters: { ...prev.healthcareParameters, [key]: value } }))
  }

  function updateFireAssumptions<K extends keyof FireInputs["fireAssumptions"]>(key: K, value: FireInputs["fireAssumptions"][K]) {
    setInputs((prev) => ({ ...prev, fireAssumptions: { ...prev.fireAssumptions, [key]: value } }))
  }

  function updateGoalInvestment<K extends keyof GoalInvestmentProfile>(key: K, value: GoalInvestmentProfile[K]) {
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
      return { ...prev, fireAssumptions: { ...prev.fireAssumptions, glidepathCheckpoints: checkpoints } }
    })
  }

  function addGlidepointCheckpoint() {
    setInputs((prev) => ({
      ...prev,
      fireAssumptions: {
        ...prev.fireAssumptions,
        glidepathCheckpoints: [...prev.fireAssumptions.glidepathCheckpoints, { age: 50, equityPercent: 50 }],
      },
    }))
  }

  function removeGlidepointCheckpoint(index: number) {
    setInputs((prev) => ({
      ...prev,
      fireAssumptions: {
        ...prev.fireAssumptions,
        glidepathCheckpoints: prev.fireAssumptions.glidepathCheckpoints.filter((_, i) => i !== index),
      },
    }))
  }

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
    e.target.value = ""
  }

  function handleCalculate() {
    onCalculate(inputs)
  }

  return {
    inputs,
    updateBase, updateExpense, updateInvestment,
    updateChild, addChild, removeChild,
    updateEducation, updateMarriage,
    updateWhitegood, addWhitegood, removeWhitegood,
    updateTravel, updateHealthcare,
    updateFireAssumptions, updateGoalInvestment,
    updateGlidepath, addGlidepointCheckpoint, removeGlidepointCheckpoint,
    fileInputRef, handleExport, handleImport, handleCalculate,
  }
}
