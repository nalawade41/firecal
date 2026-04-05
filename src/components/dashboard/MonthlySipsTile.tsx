"use client"

import { useState } from "react"
import type { DashboardView } from "@/types/dashboard"
import { SipRow } from "./SipRow"

interface MonthlySipsTileProps {
  sips: DashboardView["sips"]
}

type FilterType = "active" | "closed"

export function MonthlySipsTile({ sips }: MonthlySipsTileProps) {
  const [filter, setFilter] = useState<FilterType>("active")

  const displayItems = filter === "active" ? sips.items : sips.closedItems || []
  const displayCount = filter === "active" ? sips.sipCount : sips.closedCount || 0
  const displayTotal = filter === "active" ? sips.totalAmount : sips.closedTotalAmount || "₹0"
  return (
    <div className="rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Monthly SIPs</p>
        {filter === "active" && sips.pendingCount > 0 && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {sips.pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "active"
              ? "bg-emerald-600 text-white"
              : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
          }`}
        >
          Active SIPs
        </button>
        <button
          type="button"
          onClick={() => setFilter("closed")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "closed"
              ? "bg-emerald-600 text-white"
              : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
          }`}
        >
          Closed/Stopped
        </button>
      </div>

      <p className="text-xl font-medium text-white/90 mb-4">
        {displayTotal}
        <span className="text-[13px] font-normal text-white/35 ml-1">/month · {displayCount} SIPs</span>
      </p>

      <div className="space-y-0">
        {displayItems.map((sip) => (
          <SipRow key={sip.label} sip={sip} />
        ))}
        {displayItems.length === 0 && (
          <p className="text-sm text-white/40 text-center py-4">
            {filter === "active" ? "No active SIPs" : "No closed/stopped SIPs"}
          </p>
        )}
      </div>
    </div>
  )
}
