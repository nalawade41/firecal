import type { AMC } from "@/types/tax-harvest"

export const AMC_OPTIONS: { value: AMC; label: string }[] = [
  { value: "sbi", label: "SBI Mutual Fund" },
  { value: "axis", label: "Axis Mutual Fund" },
]

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "buy", label: "Buy" },
  { value: "sip", label: "SIP" },
  { value: "sell", label: "Sell" },
  { value: "switch-in", label: "Switch In" },
  { value: "switch-out", label: "Switch Out" },
  { value: "bonus", label: "Bonus" },
  { value: "dividend-reinvest", label: "Div Reinvest" },
] as const
