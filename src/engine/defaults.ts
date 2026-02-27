import type { FireInputs } from "@/types"

export const defaultInputs: FireInputs = {
  baseProfile: {
    currentYear: new Date().getFullYear(),
    currentAge: 35,
    retirementAge: 50,
    lifeExpectancyAge: 85,
    numberOfKids: 2,
  },
  expenseProfile: {
    currentAnnualHouseholdExpense: 1200000,
    expenseInflationPercent: 7,
    expenseAdjustmentFactorAtRetirement: 0.8,
  },
  investmentProfile: {
    currentPortfolioValue: 5000000,
    annualSavings: 1500000,
    annualSavingsIncreasePercent: 10,
  },
  children: [
    {
      currentAge: 5,
      schoolStartAge: 4,
      graduationStartAge: 18,
      postGraduationStartAge: 22,
      marriageAge: 28,
    },
    {
      currentAge: 2,
      schoolStartAge: 4,
      graduationStartAge: 18,
      postGraduationStartAge: 22,
      marriageAge: 28,
    },
  ],
  educationParameters: {
    school: {
      currentAnnualFee: 200000,
      inflationPercent: 10,
      durationYears: 14,
    },
    graduation: {
      currentTotalCost: 2000000,
      inflationPercent: 10,
      durationYears: 4,
    },
    postGraduation: {
      currentTotalCost: 3000000,
      inflationPercent: 10,
      durationYears: 2,
    },
  },
  marriageParameters: {
    currentCostPerChild: 2500000,
    inflationPercent: 7,
  },
  whitegoods: [
    {
      itemName: "Car",
      currentCost: 1500000,
      replacementFrequencyYears: 10,
      inflationPercent: 6,
    },
    {
      itemName: "Home Appliances",
      currentCost: 300000,
      replacementFrequencyYears: 7,
      inflationPercent: 5,
    },
  ],
  travelParameters: {
    currentAnnualCost: 200000,
    inflationPercent: 8,
    stopAge: 70,
  },
  healthcareParameters: {
    currentAnnualMedicalExpense: 50000,
    medicalInflationPercent: 10,
    currentInsurancePremium: 60000,
    insurancePremiumInflationPercent: 8,
  },
  fireAssumptions: {
    safeWithdrawalRatePercent: 3,
    expectedEquityReturnPercent: 12,
    expectedDebtReturnPercent: 7,
    glidepathCheckpoints: [
      { age: 35, equityPercent: 80 },
      { age: 50, equityPercent: 60 },
      { age: 65, equityPercent: 40 },
      { age: 80, equityPercent: 20 },
    ],
    goalInvestment: {
      equityReturnPercent: 13,
      debtReturnPercent: 7,
      equityPercent: 70,
      debtPercent: 30,
    },
  },
}
