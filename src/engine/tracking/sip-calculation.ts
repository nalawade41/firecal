import type { OnboardingData, SipEntry } from "@/types/onboarding"
import { formatINR } from "@/lib/utils"

export interface SipDashboardItem {
  label: string // Short fund name (first part before first -)
  sublabel: string // Goal name
  sublabelColor: string // Goal color for the sublabel text
  amount: string
  status: "processed" | "pending" | "closed"
  dotColor: string
  runtime?: string // Runtime in months for closed SIPs
}

export interface SipDashboardData {
  totalAmount: string
  sipCount: number
  pendingCount: number
  items: SipDashboardItem[]
  closedTotalAmount: string
  closedCount: number
  closedItems: SipDashboardItem[]
}

// Goal colors for dot indicators
const GOAL_COLORS: Record<string, string> = {
  fire: "#10b981", // emerald-500
  "school-fees": "#3b82f6", // blue-500
  graduation: "#8b5cf6", // violet-500
  marriage: "#ec4899", // pink-500
  "house-down-payment": "#f59e0b", // amber-500
  whitegoods: "#06b6d4", // cyan-500
  custom: "#64748b", // slate-500
}

/**
 * Get goal label from goalId
 * Handles both simple goals ("fire") and compound goals ("school-fees::Kid1")
 */
function getGoalLabel(goalId: string, data: OnboardingData): string {
  // Simple goals
  if (goalId === "fire") return "FIRE"
  if (goalId === "house-down-payment") return "House"

  // Compound goals (format: "type::subLabel")
  if (goalId.includes("::")) {
    const [type, subLabel] = goalId.split("::")

    if (type === "school-fees") return subLabel || "School"
    if (type === "graduation") return subLabel || "Grad"
    if (type === "marriage") return subLabel || "Marriage"
    if (type === "whitegoods") return subLabel || "Item"
    if (type === "custom") {
      const customDef = data.customGoalDefinitions?.find((d) => d.id === subLabel)
      return customDef?.name || "Custom"
    }
  }

  return goalId
}

/**
 * Extract short fund name (first part before first "-")
 * e.g., "SBI Small Cap Fund - Direct Plan - Growth" -> "SBI Small Cap Fund"
 */
function getShortFundName(fundName: string): string {
  if (!fundName) return "Unknown Fund"
  const parts = fundName.split("-")
  return parts[0]?.trim() || fundName
}

/**
 * Calculate runtime in months between startDate and endDate
 */
function getRuntime(sip: SipEntry): string {
  if (!sip.startDate) return ""
  const start = new Date(sip.startDate)
  const end = sip.endDate ? new Date(sip.endDate) : new Date()
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (months < 1) return "<1 mo"
  if (months >= 12) {
    const years = Math.floor(months / 12)
    const remaining = months % 12
    return remaining > 0 ? `${years}y ${remaining}m` : `${years}y`
  }
  return `${months}m`
}

function getGoalBaseType(goalId: string): string {
  if (goalId.includes("::")) {
    return goalId.split("::")[0]
  }
  return goalId
}

/**
 * Determine if a SIP is done or pending based on its startDate
 * SIP date is the day of the month extracted from startDate when the installment is executed
 * If today's day >= SIP date (adjusted for weekends), status is done
 */
function getSipStatus(sip: SipEntry): "processed" | "pending" | "closed"  {
  if (!sip.startDate) return "pending"

  const today = new Date()
  
  // Extract day from startDate (format: "YYYY-MM-DD")
  const startDateParts = sip.startDate.split("-")
  const sipDay = parseInt(startDateParts[2], 10)

  // If sipDay is invalid, return pending
  if (isNaN(sipDay) || sipDay < 1 || sipDay > 31) return "pending"
  
  // Get this month's SIP execution date (accounting for weekends)
  const executionDate = new Date(today.getFullYear(), today.getMonth(), sipDay)

  // Adjust for weekends (Saturday=6, Sunday=0)
  const dayOfWeek = executionDate.getDay()
  if (dayOfWeek === 0) {
    // Sunday - move to Monday
    executionDate.setDate(executionDate.getDate() + 1)
  } else if (dayOfWeek === 6) {
    // Saturday - move to Monday
    executionDate.setDate(executionDate.getDate() + 2)
  }

  // If today is on or after the execution date, it's processed
  if (today >= executionDate) {
    return "processed"
  }

  return "pending"
}

/**
 * Check if a SIP is currently active
 * - isActive must be true
 * - If endDate exists, it must be in the future
 */
function isSipActive(sip: SipEntry): boolean {
  if (!sip.isActive) return false

  // If there's an endDate, check if it's in the future
  if (sip.endDate) {
    const endDate = new Date(sip.endDate)
    const today = new Date()
    if (endDate < today) return false
  }

  return true
}

/**
 * Calculate Monthly SIPs dashboard data from OnboardingData
 */
export function calculateMonthlySips(data: OnboardingData): SipDashboardData {
  const sips = data.sipInvestments || []

  // Filter active and closed SIPs
  const activeSips = sips.filter(isSipActive)
  const closedSips = sips.filter((sip) => !isSipActive(sip))

  // Calculate active SIPs totals
  const totalAmount = activeSips.reduce((sum, sip) => sum + (sip.amount || 0), 0)
  const sipCount = activeSips.length

  // Calculate closed SIPs totals
  const closedTotalAmount = closedSips.reduce((sum, sip) => sum + (sip.amount || 0), 0)
  const closedCount = closedSips.length

  // Build active items array
  const items: SipDashboardItem[] = activeSips.map((sip) => {
    const goalId = sip.goalId || "uncategorized"
    const sublabel = getGoalLabel(goalId, data)
    const baseType = getGoalBaseType(goalId)
    const dotColor = GOAL_COLORS[baseType] || GOAL_COLORS.custom
    const status = getSipStatus(sip)

    return {
      label: getShortFundName(sip.fundName),
      sublabel,
      sublabelColor: dotColor,
      amount: formatINR(sip.amount || 0),
      status: status,
      dotColor,
    }
  })

  // Build closed items array
  const closedItems: SipDashboardItem[] = closedSips.map((sip) => {
    const goalId = sip.goalId || "uncategorized"
    const sublabel = getGoalLabel(goalId, data)
    const baseType = getGoalBaseType(goalId)
    const dotColor = GOAL_COLORS[baseType] || GOAL_COLORS.custom

    return {
      label: getShortFundName(sip.fundName),
      sublabel,
      sublabelColor: dotColor,
      amount: formatINR(sip.amount || 0),
      status: "closed" as const,
      dotColor,
      runtime: getRuntime(sip),
    }
  })

  // Count pending SIPs
  const pendingCount = items.filter((item) => item.status === "pending").length

  // Sort items by amount descending
  const sortByAmount = (a: SipDashboardItem, b: SipDashboardItem) => {
    const parseAmount = (amt: string) => {
      const num = amt.replace(/[₹,]/g, "")
      if (num.includes("Cr")) return parseFloat(num) * 10000000
      if (num.includes("L")) return parseFloat(num) * 100000
      return parseFloat(num)
    }
    return parseAmount(b.amount) - parseAmount(a.amount)
  }

  items.sort(sortByAmount)
  closedItems.sort(sortByAmount)

  return {
    totalAmount: formatINR(totalAmount),
    sipCount,
    pendingCount,
    items,
    closedTotalAmount: formatINR(closedTotalAmount),
    closedCount,
    closedItems,
  }
}
