export function NewGoalCard() {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 flex flex-col items-center justify-center gap-2 min-h-[180px] cursor-pointer hover:bg-white/[0.06] transition-colors">
      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-xl text-white/30">
        +
      </div>
      <p className="text-[13px] font-medium text-white/50">New goal</p>
      <p className="text-[11px] text-white/25 text-center leading-relaxed">
        FIRE · School · Marriage
        <br />
        Graduation · Custom
      </p>
    </div>
  )
}
