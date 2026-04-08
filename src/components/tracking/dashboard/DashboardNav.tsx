import { Button } from "@/components/ui/button"
import { DASHBOARD_NAV_TABS } from "./constants/Dashboard.constants"

export function DashboardNav() {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-white/5 rounded-[var(--wt-r-lg)] p-1 border border-white/10">
        {DASHBOARD_NAV_TABS.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            className={
              tab === "Dashboard"
                ? "wt-btn wt-btn-primary"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }
          >
            {tab}
          </Button>
        ))}
      </div>
      <Button size="sm" className="wt-btn wt-btn-primary">+ New goal</Button>
      <Button size="sm" className="wt-btn wt-btn-primary">+ Transaction</Button>
    </div>
  )
}
