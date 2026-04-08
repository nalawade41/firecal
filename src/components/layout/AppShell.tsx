import type { ReactNode } from "react"
import { Link, useLocation } from "react-router"
import { Flame, Leaf, BarChart3 } from "lucide-react"
import { ROUTE_PATHS } from "@/routes"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const activePath = location.pathname

  function navClass(path: string, activeColor: string) {
    return `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activePath === path ? activeColor : "text-[var(--wt-ink2)] hover:bg-[var(--wt-foam)]"
    }`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-7 w-7 text-orange-500" />
            <h1 className="text-xl font-bold tracking-tight">FireCal</h1>
            <span className="text-sm text-muted-foreground ml-1">FIRE Planning & Tax Tools</span>
          </div>
          <nav className="flex gap-2 items-center">
            <Link to={ROUTE_PATHS.home} className={navClass(ROUTE_PATHS.home, "bg-orange-100 text-orange-700")}>
              FIRE Calculator
            </Link>
            <Link to={ROUTE_PATHS.taxHarvest} className={navClass(ROUTE_PATHS.taxHarvest, "bg-emerald-100 text-emerald-700")}>
              <Leaf className="h-4 w-4 inline mr-1" />
              Tax Harvest
            </Link>
            <Link to={ROUTE_PATHS.tracking} className={navClass(ROUTE_PATHS.tracking, "bg-blue-100 text-blue-700")}>
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Tracking
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 space-y-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/60 bg-white/40 backdrop-blur-xl mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          FireCal — Phase 1 • All calculations are pre-tax • INR
        </div>
      </footer>
    </div>
  )
}
