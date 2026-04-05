const NAV_TABS = ["Dashboard", "Goals", "Transactions", "LTCG Harvest"] as const

export function DashboardNav() {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
        {NAV_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "Dashboard"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
        + New goal
      </button>
      <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
        + Transaction
      </button>
    </div>
  )
}
