/**
 * Generic CSV Parser
 * Handles standard CSV format for any AMC
 */

import type { Transaction } from "@/types/tax-harvest"

/**
 * Parse Generic CSV format: Date, Type, Units, NAV, Amount, [Fund Name]
 */
export function parseGenericCSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split("\n")
  const transactions: Transaction[] = []

  if (lines.length === 0) return transactions

  // Skip header row
  const startIndex = lines[0].toLowerCase().includes("date") ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 5) continue

    try {
      const dateStr = parts[0].trim()
      const typeStr = parts[1].trim().toLowerCase()
      const units = parseFloat(parts[2])
      const nav = parseFloat(parts[3])
      const amount = parseFloat(parts[4])
      const fundName = parts[5]?.trim()

      if (!dateStr || isNaN(nav) || isNaN(amount) || isNaN(units)) continue

      const date = parseCSVDate(dateStr)
      if (!date) continue

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
 * Parse date from CSV (handles DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD)
 */
function parseCSVDate(dateStr: string): Date | null {
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map(Number)
    if (parts[0] > 12) {
      // DD/MM/YYYY format
      return new Date(parts[2], parts[1] - 1, parts[0])
    } else {
      // MM/DD/YYYY format (could also be DD/MM if day <= 12)
      // Try both interpretations
      const asMMDD = new Date(parts[2], parts[0] - 1, parts[1])
      const asDDMM = new Date(parts[2], parts[1] - 1, parts[0])

      // Return the one that makes more sense (not in future, not too old)
      const now = new Date()
      const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      const minDate = new Date(1990, 0, 1)

      if (asMMDD <= maxDate && asMMDD >= minDate) {
        return asMMDD
      }
      if (asDDMM <= maxDate && asDDMM >= minDate) {
        return asDDMM
      }
      return asMMDD // default
    }
  }
  const date = new Date(dateStr)
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
