import type { FireSummaryProps } from "./types/FireSummary.types"
import { SurvivalBanner } from "./sections/SurvivalBanner"
import { CorpusBreakdown } from "./sections/CorpusBreakdown"
import { PortfolioGap } from "./sections/PortfolioGap"
import { GoalPlanningSection } from "./sections/GoalPlanningSection"

export function FireSummary({ summary }: FireSummaryProps) {
  const goalMonthlySipTotal = summary.goalCategories
    .filter((c) => c.category !== "living")
    .reduce((s, c) => s + c.totalMonthlySip, 0)

  return (
    <div className="space-y-6">
      <SurvivalBanner
        survived={summary.portfolioSurvival.survived}
        finalBalance={summary.portfolioSurvival.finalBalance}
        depletionAge={summary.portfolioSurvival.depletionAge}
        depletionYear={summary.portfolioSurvival.depletionYear}
      />

      <CorpusBreakdown
        retirementLivingCorpus={summary.retirementLivingCorpus}
        totalGoalCorpus={summary.totalGoalCorpus}
        totalRequiredCorpus={summary.totalRequiredCorpus}
      />

      <PortfolioGap
        portfolioAtRetirement={summary.portfolioAtRetirement}
        corpusGap={summary.corpusGap}
        livingCorpusGap={summary.livingCorpusGap}
        goalCorpusGap={summary.goalCorpusGap}
        totalGoalLumpsumToday={summary.totalGoalLumpsumToday}
        totalMonthlySipRequired={summary.totalMonthlySipRequired}
        totalAnnualSipRequired={summary.totalAnnualSipRequired}
      />

      <GoalPlanningSection
        totalGoalLumpsumToday={summary.totalGoalLumpsumToday}
        totalGoalCorpus={summary.totalGoalCorpus}
        longestGoalHorizonYears={summary.longestGoalHorizonYears}
        goalCategories={summary.goalCategories}
        goalMonthlySipTotal={goalMonthlySipTotal}
      />
    </div>
  )
}
