import type { SummaryResult, GoalBucket, GoalCategorySummary } from "@/types"
import {
  GraduationCap,
  Heart,
  Stethoscope,
  Refrigerator,
  Plane,
  Home,
  Flame,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"

interface ResultsSummaryProps {
  summary: SummaryResult
}

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

const categoryIcons: Record<string, React.ReactNode> = {
  education: <GraduationCap className="h-5 w-5 text-blue-600" />,
  marriage: <Heart className="h-5 w-5 text-pink-600" />,
  healthcare: <Stethoscope className="h-5 w-5 text-red-500" />,
  whitegoods: <Refrigerator className="h-5 w-5 text-slate-600" />,
  travel: <Plane className="h-5 w-5 text-sky-600" />,
  living: <Home className="h-5 w-5 text-emerald-600" />,
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  )
}

function BucketCard({ bucket }: { bucket: GoalBucket }) {
  return (
    <div className="rounded-lg border border-white/50 bg-white/30 p-4 space-y-2 text-sm">
      <div>
        <p className="font-semibold text-sm">{bucket.label}</p>
        <p className="text-xs text-muted-foreground">{bucket.sublabel}</p>
      </div>
      <Row label="Today's Cost" value={formatINR(bucket.presentCost)} />
      <Row label="Future Cost (inflated)" value={formatINR(bucket.futureCost)} />
      <Row label="Years to Goal" value={String(bucket.yearsToGoal)} />
      <Row label={`Expected Return`} value={`${bucket.expectedReturnPercent.toFixed(1)}%`} />
      <div className="h-px bg-border/40" />
      <Row label="Lumpsum Today" value={formatINR(bucket.lumpsumToday)} />
      <Row label="Monthly SIP" value={formatINR(bucket.monthlySip)} bold />
    </div>
  )
}

function CategorySection({ cat }: { cat: GoalCategorySummary }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          {categoryIcons[cat.category]}
          <div>
            <p className="font-semibold">{cat.label}</p>
            <p className="text-xs text-muted-foreground">
              {cat.buckets.length} goal{cat.buckets.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Future Cost</p>
            <p className="font-medium">{formatINR(cat.totalFutureCost)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Lumpsum</p>
            <p className="font-medium">{formatINR(cat.totalLumpsumToday)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Monthly SIP</p>
            <p className="font-bold text-primary">{formatINR(cat.totalMonthlySip)}</p>
          </div>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <div className={`grid gap-3 ${cat.buckets.length > 1 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-md"}`}>
            {cat.buckets.map((bucket, i) => (
              <BucketCard key={i} bucket={bucket} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
          <CategorySection key={cat.category} cat={cat} />
        ))}
      </div>
    </div>
  )
}
