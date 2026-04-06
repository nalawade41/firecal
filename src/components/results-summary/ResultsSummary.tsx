import {
  Home,
  Flame,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
} from "lucide-react"
import { formatINR } from "@/lib/utils"
import type { ResultsSummaryProps } from "./types/ResultsSummary.types"
import { CATEGORY_ICONS } from "./constants/ResultsSummary.constants"
import { CategorySection } from "./sections/CategorySection"

export function ResultsSummary({ summary }: ResultsSummaryProps) {
  const survived = summary.portfolioSurvival.survived
  const gap = summary.corpusGap

  return (
    <div className="space-y-6">
      {/* Survival Banner */}
      <div
        className={`rounded-xl border backdrop-blur-xl shadow-sm p-6 flex items-center gap-4 ${
          survived
            ? "border-green-200/60 bg-green-50/40"
            : "border-red-200/60 bg-red-50/40"
        }`}
      >
        {survived ? (
          <CheckCircle className="h-10 w-10 text-green-600 shrink-0" />
        ) : (
          <AlertTriangle className="h-10 w-10 text-red-600 shrink-0" />
        )}
        <div>
          <h3 className="text-xl font-bold">
            {survived ? "Portfolio Survived!" : "Portfolio Depleted"}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {survived
              ? `Final balance: ${formatINR(summary.portfolioSurvival.finalBalance)}`
              : `Depleted at age ${summary.portfolioSurvival.depletionAge} (${summary.portfolioSurvival.depletionYear})`}
          </p>
        </div>
      </div>

      {/* Corpus Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <Home className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-muted-foreground">Retirement Living Corpus</span>
          </div>
          <p className="text-2xl font-bold">{formatINR(summary.retirementLivingCorpus)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Min corpus at retirement to fund all expenses till life expectancy</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <Flame className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-muted-foreground">Total Goal Corpus</span>
          </div>
          <p className="text-2xl font-bold">{formatINR(summary.totalGoalCorpus)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Education + Marriage + Healthcare + Whitegoods + Travel</p>
        </div>
        <div className="rounded-xl border border-purple-200/60 bg-purple-50/40 backdrop-blur-xl shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <IndianRupee className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-muted-foreground">Total Required Corpus</span>
          </div>
          <p className="text-2xl font-bold">{formatINR(summary.totalRequiredCorpus)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Living + Goals combined</p>
        </div>
      </div>

      {/* Portfolio & Gap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-muted-foreground">Portfolio at Retirement</span>
          </div>
          <p className="text-2xl font-bold">{formatINR(summary.portfolioAtRetirement)}</p>
        </div>
        <div className={`rounded-xl border backdrop-blur-xl shadow-sm p-5 ${gap > 0 ? "border-red-200/60 bg-red-50/40" : "border-green-200/60 bg-green-50/40"}`}>
          <div className="flex items-center gap-2.5 mb-2">
            {gap > 0 ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
            <span className="text-sm font-medium text-muted-foreground">
              {gap > 0 ? "Corpus Shortfall" : "Corpus Surplus"}
            </span>
          </div>
          <p className="text-2xl font-bold">{gap > 0 ? "−" : "+"}{formatINR(Math.abs(gap))}</p>
          {gap > 0 && (
            <div className="mt-2 space-y-1">
              {summary.livingCorpusGap > 0 && (
                <p className="text-xs text-red-600">
                  Living corpus shortfall: {formatINR(summary.livingCorpusGap)} — increase savings or delay retirement.
                </p>
              )}
              {summary.goalCorpusGap > 0 && (
                <p className="text-xs text-red-600">
                  Goal corpus shortfall: {formatINR(summary.goalCorpusGap)} — adjust goals or invest {formatINR(summary.totalGoalLumpsumToday)} lumpsum today for all goals.
                </p>
              )}
              {summary.livingCorpusGap <= 0 && summary.goalCorpusGap > 0 && (
                <p className="text-xs text-amber-700">
                  Retirement living is fully funded. Shortfall is entirely from goal-based expenses.
                </p>
              )}
            </div>
          )}
          {gap <= 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Portfolio at retirement exceeds total required corpus.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 backdrop-blur-xl shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <IndianRupee className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Total Monthly SIP</span>
          </div>
          <p className="text-2xl font-bold">{formatINR(summary.totalMonthlySipRequired)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Annual: {formatINR(summary.totalAnnualSipRequired)}</p>
        </div>
      </div>

      {/* Goal-Based Planning */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Goal-Based Planning</h3>

        {/* Goal Summary Banner */}
        <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/40 backdrop-blur-xl shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Lumpsum Today</p>
              <p className="text-xl font-bold text-indigo-700">{formatINR(summary.totalGoalLumpsumToday)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">One-time investment to cover all goals</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Monthly SIP (Goals)</p>
              <p className="text-xl font-bold text-indigo-700">
                {formatINR(summary.goalCategories
                  .filter((c) => c.category !== "living")
                  .reduce((s, c) => s + c.totalMonthlySip, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                For up to {summary.longestGoalHorizonYears} years
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Future Cost (Goals)</p>
              <p className="text-xl font-bold text-indigo-700">{formatINR(summary.totalGoalCorpus)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inflated cost of all goals combined</p>
            </div>
          </div>
        </div>

        {summary.goalCategories.map((cat) => (
          <CategorySection key={cat.category} cat={cat} icon={CATEGORY_ICONS[cat.category]} />
        ))}
      </div>
    </div>
  )
}
