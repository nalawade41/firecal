/**
 * Axis Mutual Fund Parser
 * Handles CSV and PDF parsing for Axis AMC
 * Uses robust PDF text extraction with position-based line grouping
 */

import type { Transaction } from "@/types/tax-harvest"
import * as pdfjsLib from "pdfjs-dist"
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

/**
 * Parse Axis AMC file - handles both CSV and PDF formats
 */
export async function parseAxisAMCFile(file: File): Promise<Transaction[]> {
  const extension = file.name.toLowerCase().split(".").pop()

  if (extension === "pdf") {
    return parseAxisPDF(file)
  } else if (extension === "csv") {
    const text = await file.text()
    return parseAxisCSV(text)
  } else {
    throw new Error("Unsupported file format. Please upload a CSV or PDF file.")
  }
}

/**
 * Parse Axis Mutual Fund CSV format
 * Format: FolioNo, Date (MM/DD/YYYY), SchemeName, Type, NAV, Amount
 */
export function parseAxisCSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split("\n")
  const transactions: Transaction[] = []

  if (lines.length === 0) return transactions

  const startIndex = 1

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(",")
    if (parts.length < 6) continue

    try {
      const dateStr = parts[1].trim()
      const fundName = parts[2].trim()
      const typeStr = parts[3].trim().toLowerCase()
      const nav = parseFloat(parts[4])
      const amount = parseFloat(parts[5])

      if (!dateStr || isNaN(nav) || isNaN(amount)) continue

      const date = parseAxisDate(dateStr)
      if (!date) continue

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
 * Parse Axis Mutual Fund PDF statement
 */
async function parseAxisPDF(file: File): Promise<Transaction[]> {
  const pages = await extractLinesFromPDF(file)
  const result = parseAxisStatementFromLines(pages)

  return result.transactions.map((txn, index) => ({
    id: `tx-${txn.pageNumber}-${index}`,
    date: parseAxisPDFDate(txn.date) || new Date(),
    type: mapTransactionType(txn.transactionType || txn.subType || "sip") || "sip",
    units: txn.units || 0,
    navPerUnit: txn.price || txn.nav || 0,
    amount: txn.amount || 0,
    fundName: txn.fundName || undefined,
  })).filter(tx => tx.amount > 0 && tx.units > 0)
}

/**
 * Extract lines from PDF with position-based grouping
 */
async function extractLinesFromPDF(file: File): Promise<PDFPage[]> {
  const arrayBuffer = await file.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    isEvalSupported: false,
  }).promise

  const pages: PDFPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const lines = groupItemsIntoLines(textContent.items as PDFTextItem[])

    pages.push({
      pageNumber,
      lines,
    })
  }

  return pages
}

/**
 * Group text items into lines based on Y-coordinate
 */
function groupItemsIntoLines(items: PDFTextItem[], yTolerance = 2.5): string[] {
  const rows: RowData[] = []

  for (const item of items) {
    const text = normalizeWhitespace(item.str)
    if (!text) continue

    const x = item.transform[4]
    const y = item.transform[5]

    let targetRow: RowData | null = null
    for (const row of rows) {
      if (Math.abs(row.y - y) <= yTolerance) {
        targetRow = row
        break
      }
    }

    if (!targetRow) {
      targetRow = { y, items: [] }
      rows.push(targetRow)
    }

    targetRow.items.push({ x, y, text })
  }

  rows.sort((a, b) => b.y - a.y)

  return rows.map((row) => {
    row.items.sort((a, b) => a.x - b.x)
    return row.items.map((item) => item.text).join(" ").trim()
  })
}

/**
 * Parse Axis statement from extracted lines
 */
function parseAxisStatementFromLines(pages: PDFPage[]): ParsedStatement {
  const allLines = pages.flatMap((page) => page.lines)
  const folioNumber = extractFolioNumber(allLines)

  const transactions: ParsedTransaction[] = []
  let currentFundName: string | null = null
  let pendingTransactionType: string | null = null
  let pendingSubType: string | null = null
  let pendingInstallmentNumber: number | null = null
  let pendingGrossData: GrossData | null = null
  let pendingStampDutyData: StampDutyData | null = null

  for (const page of pages) {
    for (const rawLine of page.lines) {
      const line = normalizeWhitespace(rawLine)
      if (!line || isLikelyHeaderLine(line)) continue

      if (isFundHeaderLine(line)) {
        currentFundName = cleanFundName(line)
        pendingTransactionType = null
        pendingSubType = null
        pendingInstallmentNumber = null
        pendingGrossData = null
        pendingStampDutyData = null
        continue
      }

      if (/^(ISIP|SIP|SWP|STP|Purchase|Redemption|Switch)$/i.test(line)) {
        pendingTransactionType = line.toUpperCase()
        continue
      }

      if (/^Systematic Investment-Online/i.test(line)) {
        if (!isFullTransactionRow(line)) {
          pendingSubType = line
          continue
        }
      }

      const counter = parseSubtypeCounter(line)
      if (counter !== null) {
        pendingInstallmentNumber = counter
        continue
      }

      const grossData = parseGrossLine(line)
      if (grossData) {
        pendingGrossData = grossData
        pendingSubType = grossData.subType
        continue
      }

      const stampData = parseStampDutyLine(line)
      if (stampData) {
        pendingStampDutyData = stampData
        continue
      }

      let rowData = parseRegularTxnRow(line)
      if (!rowData) {
        rowData = parseNetPurchaseTxnRow(line)
      }
      if (rowData) {
        const txn = buildTransaction({
          fundName: currentFundName,
          folioNumber,
          transactionType: pendingTransactionType,
          subType: pendingSubType,
          installmentNumber: pendingInstallmentNumber,
          rowData,
          grossData: pendingGrossData,
          stampDutyData: pendingStampDutyData,
          pageNumber: page.pageNumber,
        })

        transactions.push(txn)

        pendingGrossData = null
        pendingStampDutyData = null
        pendingInstallmentNumber = null
      }
    }
  }

  return {
    folioNumber,
    fundNames: Array.from(new Set(transactions.map((x) => x.fundName).filter((name): name is string => name !== null))),
    transactionCount: transactions.length,
    transactions,
  }
}

function isFullTransactionRow(line: string) {
  return /^.*?\s+\d{2}\/\d{2}\/\d{4}\s+[\d.]+\s+\d{2}\/\d{2}\/\d{4}\s+[\d,]+\.\d{2}\s+[\d.]+\s+[\d.]+\s+[\d,.]+$/.test(line)
}

/**
 * Build a transaction object
 */
function buildTransaction(params: TransactionBuildParams): ParsedTransaction {
  return {
    folioNumber: params.folioNumber,
    fundName: params.fundName,
    transactionType: params.transactionType,
    subType: params.subType,
    installmentNumber: params.installmentNumber,
    date: params.rowData.date,
    nav: params.rowData.nav,
    navDate: params.rowData.navDate,
    grossAmount: params.grossData?.grossAmount ?? null,
    stampDuty: params.stampDutyData?.stampDuty ?? null,
    stt: null,
    amount: params.rowData.amount,
    netAmount: params.grossData ? params.rowData.amount : null,
    price: params.rowData.price,
    units: params.rowData.units,
    runningUnits: params.rowData.runningUnits,
    pageNumber: params.pageNumber,
  }
}

// Helper functions

function normalizeWhitespace(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()
}

function isLikelyHeaderLine(line: string): boolean {
  return (
    /^Transaction Type Date NAV Stamp Duty/i.test(line) ||
    /^Price in/i.test(line) ||
    /^Units Balance/i.test(line) ||
    /^NAV Date$/i.test(line) ||
    /^Page \d+ OF \d+$/i.test(line) ||
    /^Name\s*:/i.test(line) ||
    /^Folio NO\./i.test(line) ||
    /^MAHESH RAMHARI NALAWADE\b/i.test(line) ||
    /^Statement Date\s*:/i.test(line)
  )
}

function isFundHeaderLine(line: string): boolean {
  return /\(Non\s*-\s*Demat\)/i.test(line) && /Axis/i.test(line)
}

function cleanFundName(line: string): string {
  return normalizeWhitespace(
    line
      .replace(/<[^>]+>/g, "")
      .replace(/\s+ISIN\s*:.*$/i, "")
      .replace(/\s+NAV as on.*$/i, "")
  )
}

function extractFolioNumber(allLines: string[]): string | null {
  for (const line of allLines) {
    const match =
      line.match(/FOLIO NO\.?\s*:\s*(\d+)/i) ||
      line.match(/FOLIO NUMBER\s*:\s*(\d+)/i) ||
      line.match(/\b(\d{8,})\s+Statement Date\s*:/i)

    if (match) return match[1]
  }
  return null
}

function parseSubtypeCounter(line: string): number | null {
  const match = line.match(/\((\d+)\/Perpetual\)/i)
  return match ? Number(match[1]) : null
}

function parseGrossLine(line: string): GrossData | null {
  const match = line.match(
    /^Gross\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+([\d,]+\.\d{2})$/i
  )

  if (!match) return null

  return {
    subType: normalizeWhitespace(match[1]),
    date: match[2],
    navDate: match[3],
    grossAmount: parseNumber(match[4]),
  }
}

function parseStampDutyLine(line: string): StampDutyData | null {
  const match = line.match(/^Stamp Duty\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.]+)$/i)

  if (!match) return null

  return {
    date: match[1],
    stampDuty: parseNumber(match[2]),
  }
}

function parseNumber(value: unknown): number | null {
  if (value == null || value === "") return null

  const cleaned = String(value).replace(/,/g, "").trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function parseRegularTxnRow(line: string): RowTransactionData | null {
  const match = line.match(
    /(\d{2}\/\d{2}\/\d{4})\s+([\d.]+)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d,]+\.\d{2})\s+([\d.]+)\s+([\d.]+)\s+([\d,.]+)$/
  )

  if (!match) return null

  return {
    date: match[1],
    nav: parseNumber(match[2]),
    navDate: match[3],
    amount: parseNumber(match[4]),
    price: parseNumber(match[5]),
    units: parseNumber(match[6]),
    runningUnits: parseNumber(match[7]),
  }
}

function parseNetPurchaseTxnRow(line: string): RowTransactionData | null {
  const match = line.match(
  /^(.*?)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.]+)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d,]+\.\d{2})\s+([\d.]+)\s+([\d,.]+)\s+([\d,.]+)$/
  );

  if (!match) {
    return null;
  }

  return {
    date: match[2],
    nav: parseNumber(match[3]),
    navDate: match[4],
    amount: parseNumber(match[5]),
    price: parseNumber(match[6]),
    units: parseNumber(match[7]),
    runningUnits: parseNumber(match[8])
  };
}

function parseAxisDate(dateStr: string): Date | null {
  if (!dateStr.includes("/")) {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  const parts = dateStr.split("/").map(Number)
  const date = new Date(parts[2], parts[0] - 1, parts[1])
  return isNaN(date.getTime()) ? null : date
}

function parseAxisPDFDate(dateStr: string): Date | null {
  if (!dateStr.includes("/")) {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  const parts = dateStr.split("/").map(Number)
  if (parts.length !== 3) return null

  const day = parts[0]
  const month = parts[1] - 1
  const year = parts[2]

  const date = new Date(year, month, day)
  return isNaN(date.getTime()) ? null : date
}

function mapTransactionType(typeStr: string): Transaction["type"] | null {
  const normalized = typeStr.toLowerCase()

  if (normalized.includes("sip") || normalized.includes("systematic")) return "sip"
  if (normalized.includes("purchase") || normalized.includes("buy")) return "buy"
  if (normalized.includes("redemption") || normalized.includes("sell")) return "sell"
  if (normalized.includes("switch-in") || normalized.includes("switch in")) return "switch-in"
  if (normalized.includes("switch-out") || normalized.includes("switch out")) return "switch-out"
  if (normalized.includes("dividend reinvest")) return "dividend-reinvest"

  return "sip"
}

// Types

interface PDFTextItem {
  str: string
  transform: number[]
}

interface PDFPage {
  pageNumber: number
  lines: string[]
}

interface RowItem {
  x: number
  y: number
  text: string
}

interface RowData {
  y: number
  items: RowItem[]
}

interface RowTransactionData {
  date: string
  nav: number | null
  navDate: string
  amount: number | null
  price: number | null
  units: number | null
  runningUnits: number | null
}

interface GrossData {
  subType: string
  date: string
  navDate: string
  grossAmount: number | null
}

interface StampDutyData {
  date: string
  stampDuty: number | null
}

interface ParsedTransaction {
  folioNumber: string | null
  fundName: string | null
  transactionType: string | null
  subType: string | null
  installmentNumber: number | null
  date: string
  nav: number | null
  navDate: string
  grossAmount: number | null
  stampDuty: number | null
  stt: null
  amount: number | null
  netAmount: number | null
  price: number | null
  units: number | null
  runningUnits: number | null
  pageNumber: number
}

interface ParsedStatement {
  folioNumber: string | null
  fundNames: string[]
  transactionCount: number
  transactions: ParsedTransaction[]
}

interface TransactionBuildParams {
  fundName: string | null
  folioNumber: string | null
  transactionType: string | null
  subType: string | null
  installmentNumber: number | null
  rowData: RowTransactionData
  grossData: GrossData | null
  stampDutyData: StampDutyData | null
  pageNumber: number
}
