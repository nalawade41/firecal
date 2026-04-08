/**
 * Maps normalized mfdata.in stock names → AMFI ISINs for known mismatches.
 * Key: normalized name as returned by normalizeStockName()
 * Value: ISIN from the AMFI classification list
 *
 * Add entries here when mfdata.in uses a different spelling than AMFI.
 * Run the app, check console warnings for unclassified stocks, and add them.
 */
export const STOCK_ALIAS_MAP: Record<string, string> = {
  // mfdata: "Sun Pharmaceuticals Industries Ltd" → AMFI: "Sun Pharmaceutical Industries Ltd."
  "sun pharmaceuticals industries": "INE044A01036",

  // mfdata: "SBI Life Insurance Co Ltd" → AMFI: "SBI Life Insurance Company Limited"
  "sbi life insurance": "INE123W01016",

  // mfdata: "Eternal Ltd" → AMFI: "Zomato Limited" (renamed)
  "eternal": "INE758T01015",

  // mfdata: "Adani Green Energy Ltd" vs AMFI possible variations
  "adani green energy": "INE364U01010",

  // mfdata: "Tata Motors Ltd" — sometimes appears without "Motors"
  "tata motors": "INE155A01022",

  // mfdata: "Power Grid Corp Of India Ltd" → AMFI: "Power Grid Corporation of India Limited"
  "power grid of india": "INE752E01010",
}
