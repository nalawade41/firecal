/**
 * FIFO Lot Engine for Tax Harvesting
 * 
 * Implements FIFO (First-In-First-Out) lot accounting for Indian mutual funds.
 * Each purchase creates a lot. Redemptions consume oldest lots first.
 */

import type { Transaction, Lot, TaxHarvestInputs } from "@/types/tax-harvest"

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((end.getTime() - start.getTime()) / msPerDay)
}

/**
 * Check if a holding period qualifies as Long Term Capital Gains (LTCG)
 * For Indian equity mutual funds: > 1 year (12 months)
 * For Indian debt mutual funds: > 3 years (36 months) - using 12 months default for now
 */
export function isLongTermHolding(purchaseDate: Date, currentDate: Date, longTermMonths: number = 12): boolean {
  const days = daysBetween(purchaseDate, currentDate)
  return days > (longTermMonths * 30.44) // Approximate months to days
}

/**
 * Calculate exit load applicability
 */
export function calculateExitLoad(
  purchaseDate: Date, 
  currentDate: Date, 
  exitLoadPeriodMonths: number, 
  exitLoadPercent: number
): { applies: boolean; percent: number } {
  const days = daysBetween(purchaseDate, currentDate)
  const exitLoadDays = exitLoadPeriodMonths * 30.44
  
  if (days < exitLoadDays && exitLoadPercent > 0) {
    return { applies: true, percent: exitLoadPercent }
  }
  return { applies: false, percent: 0 }
}

/**
 * Process transactions using FIFO to build lots
 * Returns the current state of all lots after processing all transactions
 */
export function processTransactionsFIFO(
  transactions: Transaction[],
  currentNav: number,
  currentDate: Date,
  longTermMonths: number = 12,
  exitLoadPeriodMonths: number = 12,
  exitLoadPercent: number = 1
): Lot[] {
  // Sort transactions by date (oldest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  )
  
  const lots: Lot[] = []
  
  for (const tx of sortedTransactions) {
    switch (tx.type) {
      case "buy":
      case "sip":
      case "switch-in":
      case "bonus":
      case "dividend-reinvest": {
        // Create a new lot for each purchase
        const lot = createLotFromTransaction(tx, currentNav, currentDate, longTermMonths, exitLoadPeriodMonths, exitLoadPercent)
        lots.push(lot)
        break
      }
      
      case "sell":
      case "switch-out": {
        // Reduce units from oldest lots first (FIFO)
        let unitsToReduce = tx.units
        
        for (const lot of lots) {
          if (unitsToReduce <= 0) break
          if (lot.remainingUnits <= 0) continue
          
          const reduction = Math.min(unitsToReduce, lot.remainingUnits)
          lot.remainingUnits -= reduction
          unitsToReduce -= reduction
          
          if (lot.remainingUnits <= 0) {
            lot.isExhausted = true
          }
        }
        break
      }
    }
  }
  
  // Update calculated fields for all remaining lots
  return lots.map(lot => updateLotCalculations(lot, currentNav, currentDate, longTermMonths, exitLoadPeriodMonths, exitLoadPercent))
}

/**
 * Create a Lot from a purchase transaction
 */
function createLotFromTransaction(
  tx: Transaction,
  currentNav: number,
  currentDate: Date,
  longTermMonths: number,
  exitLoadPeriodMonths: number,
  exitLoadPercent: number
): Lot {
  const lot: Lot = {
    id: `lot-${tx.id}`,
    purchaseDate: tx.date,
    originalUnits: tx.units,
    remainingUnits: tx.units,
    buyNav: tx.navPerUnit,
    currentNav: currentNav,
    holdingPeriodDays: 0,
    isLongTerm: false,
    gainPerUnit: 0,
    totalUnrealizedGain: 0,
    exitLoadPercent: 0,
    exitLoadApplies: false,
    isExhausted: false,
  }
  
  return updateLotCalculations(lot, currentNav, currentDate, longTermMonths, exitLoadPeriodMonths, exitLoadPercent)
}

/**
 * Update all calculated fields for a lot
 */
function updateLotCalculations(
  lot: Lot,
  currentNav: number,
  currentDate: Date,
  longTermMonths: number,
  exitLoadPeriodMonths: number,
  exitLoadPercent: number
): Lot {
  lot.currentNav = currentNav
  lot.holdingPeriodDays = daysBetween(lot.purchaseDate, currentDate)
  lot.isLongTerm = isLongTermHolding(lot.purchaseDate, currentDate, longTermMonths)
  lot.gainPerUnit = lot.currentNav - lot.buyNav
  lot.totalUnrealizedGain = lot.gainPerUnit * lot.remainingUnits
  
  const exitLoad = calculateExitLoad(lot.purchaseDate, currentDate, exitLoadPeriodMonths, exitLoadPercent)
  lot.exitLoadApplies = exitLoad.applies
  lot.exitLoadPercent = exitLoad.percent
  
  return lot
}

/**
 * Calculate the harvest plan based on LTCG exemption limit
 */
export function calculateHarvestPlan(
  lots: Lot[],
  inputs: TaxHarvestInputs
): import("@/types/tax-harvest").HarvestPlan {
  const warnings: string[] = []
  
  // Filter to only eligible long-term lots with positive gains
  const eligibleLots = lots.filter(lot => 
    lot.isLongTerm && 
    lot.remainingUnits > 0 && 
    lot.gainPerUnit > 0 &&
    !lot.exitLoadApplies // Skip lots with exit load for harvesting
  )
  
  if (eligibleLots.length === 0) {
    warnings.push("No eligible long-term lots available for harvesting")
  }
  
  // Sort by purchase date (FIFO order)
  const sortedLots = [...eligibleLots].sort((a, b) => 
    a.purchaseDate.getTime() - b.purchaseDate.getTime()
  )
  
  // Calculate remaining headroom
  const remainingHeadroom = Math.max(0, inputs.ltcgExemptionLimit - inputs.alreadyRealizedLTCG)
  
  if (remainingHeadroom <= 0) {
    warnings.push("LTCG exemption limit already exhausted for this financial year")
  }
  
  const harvestableLots: import("@/types/tax-harvest").HarvestableLot[] = []
  let cumulativeGain = 0
  let partialLot: import("@/types/tax-harvest").HarvestableLot | null = null
  
  for (const lot of sortedLots) {
    if (cumulativeGain >= remainingHeadroom) break
    
    const potentialGain = lot.totalUnrealizedGain
    
    if (cumulativeGain + potentialGain <= remainingHeadroom) {
      // Full lot can be redeemed
      harvestableLots.push({
        lot,
        fullyRedeemable: true,
        redeemableUnits: lot.remainingUnits,
        redemptionValue: lot.remainingUnits * lot.currentNav,
        harvestableGain: potentialGain,
        isPartial: false,
      })
      cumulativeGain += potentialGain
    } else {
      // Partial redemption needed
      const remainingHeadroomForThisLot = remainingHeadroom - cumulativeGain
      const unitsToRedeem = remainingHeadroomForThisLot / lot.gainPerUnit
      const redemptionValue = unitsToRedeem * lot.currentNav
      const harvestableGain = unitsToRedeem * lot.gainPerUnit
      
      partialLot = {
        lot,
        fullyRedeemable: false,
        redeemableUnits: unitsToRedeem,
        redemptionValue,
        harvestableGain,
        isPartial: true,
      }
      harvestableLots.push(partialLot)
      cumulativeGain += harvestableGain
      break
    }
  }
  
  const totalUnitsToRedeem = harvestableLots.reduce((sum, h) => sum + h.redeemableUnits, 0)
  const totalRedemptionValue = harvestableLots.reduce((sum, h) => sum + h.redemptionValue, 0)
  
  return {
    totalHarvestableGain: cumulativeGain,
    remainingHeadroom: remainingHeadroom - cumulativeGain,
    lots: harvestableLots,
    partialLot,
    totalUnitsToRedeem,
    totalRedemptionValue,
    warnings,
  }
}

