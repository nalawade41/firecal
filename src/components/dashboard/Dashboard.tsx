import { TrendingUp, Flame, Target, PiggyBank, Wallet, Settings } from "lucide-react"
import type { OnboardingData } from "@/types/onboarding"
import type { GoalSummary } from "@/types/dashboard"
import { useDashboardData } from "@/hooks/useDashboardData"
import { formatINR } from "@/lib/utils"

interface DashboardProps {
  data: OnboardingData
  onEditPlan: () => void
}

export function Dashboard({ data, onEditPlan }: DashboardProps) {
  const dashboard = useDashboardData(data)
  const { netWorth, fire, goals } = dashboard

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-500">Your financial plan at a glance</p>
        </div>
        <button
          type="button"
          onClick={onEditPlan}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Settings className="h-4 w-4" />
          Edit Plan
        </button>
      </div>

      {/* Row 1: Net Worth + FIRE panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NetWorthCard netWorth={netWorth} />
        {fire && <FirePanel fire={fire} currentAge={data.profile.currentAge} />}
      </div>

      {/* Row 2: Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={<Target className="h-4 w-4 text-emerald-600" />} label="Goals Tracked" value={`${goals.length + (fire ? 1 : 0)}`} />
        <MiniStat icon={<PiggyBank className="h-4 w-4 text-blue-600" />} label="Total SIP Needed" value={formatINR(dashboard.totalMonthlySip)} sub="/month" />
        <MiniStat icon={<Wallet className="h-4 w-4 text-purple-600" />} label="Total Lumpsum Needed" value={formatINR(dashboard.totalLumpsumNeeded)} sub="today" />
        <MiniStat icon={<TrendingUp className="h-4 w-4 text-orange-600" />} label="Net Worth" value={formatINR(netWorth.total)} />
      </div>

      {/* Row 3: Goal cards */}
      {goals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Goal Targets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function MiniStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-900">
        {value}
        {sub && <span className="text-xs font-normal text-slate-400 ml-1">{sub}</span>}
      </p>
    </div>
  )
}

function NetWorthCard({ netWorth }: { netWorth: ReturnType<typeof useDashboardData>["netWorth"] }) {
  const segments = [
    { label: "MF Portfolio", value: netWorth.mfPortfolio, color: "bg-emerald-500" },
    { label: "EPF", value: netWorth.epf, color: "bg-blue-500" },
    { label: "NPS", value: netWorth.nps, color: "bg-violet-500" },
    { label: "PPF", value: netWorth.ppf, color: "bg-cyan-500" },
    { label: "Gold", value: netWorth.gold, color: "bg-amber-500" },
    { label: "Emergency", value: netWorth.emergencyFund, color: "bg-slate-400" },
    { label: "Savings & Other", value: netWorth.savings + netWorth.other + netWorth.silver, color: "bg-gray-400" },
  ].filter((s) => s.value > 0)

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">Total Net Worth</p>
      <p className="text-3xl font-bold text-emerald-700 mb-4">{formatINR(netWorth.total)}</p>

      {/* Stacked bar */}
      {netWorth.total > 0 && (
        <div className="flex h-3 rounded-full overflow-hidden mb-4">
          {segments.map((s) => (
            <div
              key={s.label}
              className={`${s.color} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(s.value / netWorth.total) * 100}%` }}
              title={`${s.label}: ${formatINR(s.value)}`}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-slate-500">{s.label}</span>
            </div>
            <span className="font-medium text-slate-700">{formatINR(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FirePanel({ fire, currentAge }: { fire: NonNullable<ReturnType<typeof useDashboardData>["fire"]>; currentAge: number }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.15),transparent_60%)] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">FIRE Corpus</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/70">
            Age {currentAge} → {currentAge + fire.yearsToFire}
          </span>
        </div>

        <p className="text-3xl font-bold text-white mb-1">{formatINR(fire.corpusRequired)}</p>
        <p className="text-xs text-white/40 mb-5">
          {fire.model === "perpetual" ? "Perpetual (SWR)" : "Finite horizon"} · {fire.expectedReturns}% pre-retirement returns
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Years Left</p>
            <p className="text-lg font-semibold text-white">{fire.yearsToFire}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Lumpsum Today</p>
            <p className="text-lg font-semibold text-emerald-300">{formatINR(fire.lumpsumNeeded)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Monthly SIP</p>
            <p className="text-lg font-semibold text-emerald-300">{formatINR(fire.sipNeeded)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const GOAL_STYLES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue:   { border: "border-blue-200",   bg: "bg-blue-50",   text: "text-blue-800",   badge: "bg-blue-100 text-blue-700" },
  purple: { border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-100 text-purple-700" },
  pink:   { border: "border-pink-200",   bg: "bg-pink-50",   text: "text-pink-800",   badge: "bg-pink-100 text-pink-700" },
  orange: { border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-800", badge: "bg-orange-100 text-orange-700" },
  teal:   { border: "border-teal-200",   bg: "bg-teal-50",   text: "text-teal-800",   badge: "bg-teal-100 text-teal-700" },
  indigo: { border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-800", badge: "bg-indigo-100 text-indigo-700" },
}

function GoalCard({ goal }: { goal: GoalSummary }) {
  const style = GOAL_STYLES[goal.colorClass] ?? GOAL_STYLES.blue

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg}/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{goal.icon}</span>
          <span className="font-semibold text-sm text-slate-800 truncate">{goal.label}</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
          {goal.horizonYears}y
        </span>
      </div>

      {/* Target */}
      <p className={`text-xl font-bold ${style.text} mb-3`}>{formatINR(goal.targetCorpus)}</p>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/70 p-2.5">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Lumpsum</p>
          <p className={`text-sm font-bold ${style.text} mt-0.5`}>{formatINR(goal.lumpsumNeeded)}</p>
        </div>
        <div className="rounded-lg bg-white/70 p-2.5">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">SIP /mo</p>
          <p className={`text-sm font-bold ${style.text} mt-0.5`}>{formatINR(goal.sipNeeded)}</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 mt-3">
        At {goal.expectedReturns}% returns over {goal.horizonYears} years
      </p>
    </div>
  )
}
