import type { HouseDownPaymentGoalDetails } from "@/types/onboarding"
import { computeLumpsumNeeded, computeSipNeeded } from "@/engine"
import type { TabProps, UseHouseTabReturn } from "../types/GoalTabs.types"

export function useHouseTab({ data, updateGoalDetails }: TabProps): UseHouseTabReturn {
  const house: HouseDownPaymentGoalDetails = data.goalDetails.houseDownPayment ?? {
    targetCost: 0,
    yearsRemaining: 5,
    inflationExpected: 7,
    expectedReturns: 12,
  }

  const inflation = house.inflationExpected ?? 7
  const expRet = house.expectedReturns ?? 12

  function update(patch: Partial<HouseDownPaymentGoalDetails>) {
    updateGoalDetails({ houseDownPayment: { ...house, ...patch } })
  }

  const inflatedTarget = Math.round(house.targetCost * Math.pow(1 + inflation / 100, house.yearsRemaining))
  const lumpsum = house.yearsRemaining > 0
    ? computeLumpsumNeeded(inflatedTarget, expRet / 100, house.yearsRemaining)
    : inflatedTarget
  const sip = house.yearsRemaining > 0
    ? computeSipNeeded(inflatedTarget, expRet / 100, house.yearsRemaining)
    : 0

  return { house, update, inflation, expRet, inflatedTarget, lumpsum, sip }
}
