import type { OnboardingStepMeta } from "@/types/onboarding"

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { id: "profile", title: "About You", description: "Your age, retirement timeline, and family." },
  { id: "expenses", title: "Monthly Expenses", description: "Household spending and inflation assumptions." },
  { id: "goal-selection", title: "Select Goals", description: "Choose the financial goals you want to track." },
  { id: "goal-details", title: "Goal Details", description: "Configure target amounts and timelines for each goal." },
  { id: "lumpsum", title: "Lumpsum Investments", description: "One-time investments you have made." },
  { id: "sip", title: "SIP Investments", description: "Recurring monthly investments you are running." },
  { id: "other-assets", title: "Other Assets", description: "EPF, NPS, gold, silver, and emergency reserves." },
  { id: "confirmation", title: "Review & Confirm", description: "Verify everything before heading to your dashboard." },
]
