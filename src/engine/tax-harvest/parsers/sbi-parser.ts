/**
 * SBI Mutual Fund Parser
 * Handles CSV parsing for SBI AMC
 */

import type { Transaction } from "@/types/tax-harvest"

/**
 * Parse SBI Mutual Fund CSV format
 * Format: FolioNo, Date (MM/DD/YYYY), SchemeName, Type, NAV, Amount
 */
export function parseSBICSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split("\n")
  const transactions: Transaction[] = []

  if (lines.length === 0) return transactions

  // Skip header row
  const startIndex = 1

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 6) continue

    try {
      // SBI Format: FolioNo, Date, SchemeName, Type, NAV, Amount
      // indices:      0        1     2          3     4    5
      const dateStr = parts[1].trim()
      const fundName = parts[2].trim()
      const typeStr = parts[3].trim().toLowerCase()
      const nav = parseFloat(parts[4])
      const amount = parseFloat(parts[5])

      if (!dateStr || isNaN(nav) || isNaN(amount)) continue

      // Parse MM/DD/YYYY format (SBI format)
      const date = parseSBIDate(dateStr)
      if (!date) continue

      // Calculate units since not provided in SBI format
      const units = nav > 0 ? amount / nav : 0

      const type = mapTransactionType(typeStr)
      if (!type) continue

      transactions.push({
        id: `tx-${i}`,
        date,
        type,
        units: Math.round(units * 10000) / 10000,
        navPerUnit: nav,
        amount,
        fundName,
      })
    } catch {
      continue
    }
  }

  return transactions
}

/**
 * Parse date from SBI format (MM/DD/YYYY)
 */
function parseSBIDate(dateStr: string): Date | null {
  if (!dateStr.includes("/")) {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  const parts = dateStr.split("/").map(Number)
  // SBI format is MM/DD/YYYY
  const date = new Date(parts[2], parts[0] - 1, parts[1])
  return isNaN(date.getTime()) ? null : date
}

/**
 * Map transaction type strings
 */
function mapTransactionType(typeStr: string): Transaction["type"] | null {
  switch (typeStr) {
    case "buy":
    case "purchase":
      return "buy"
    case "sip":
      return "sip"
    case "sell":
    case "redemption":
      return "sell"
    case "switch-in":
    case "switch in":
      return "switch-in"
    case "switch-out":
    case "switch out":
      return "switch-out"
    case "bonus":
      return "bonus"
    case "dividend-reinvest":
    case "dividend reinvest":
      return "dividend-reinvest"
    default:
      return null
  }
}
