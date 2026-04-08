import { GlassPanel } from "@/components/ui/glass-panel"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import type { MonthlySipsTileProps } from "./types/Dashboard.components.types"
import { SipRow } from "./SipRow"

export function MonthlySipsTile({ sips, filter, onFilterChange, displayItems, displayCount, displayTotal }: MonthlySipsTileProps) {
  return (
    <GlassPanel variant="subtle" className="!p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="wt-label-light">Monthly SIPs</p>
        {filter === "active" && sips.pendingCount > 0 && (
          <StatusBadge variant="amber-dark">{sips.pendingCount} pending</StatusBadge>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Button
          size="sm"
          onClick={() => onFilterChange("active")}
          className={filter === "active"
            ? "wt-btn wt-btn-primary"
            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border-0"
          }
        >
          Active SIPs
        </Button>
        <Button
          size="sm"
          onClick={() => onFilterChange("closed")}
          className={filter === "closed"
            ? "wt-btn wt-btn-primary"
            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border-0"
          }
        >
          Closed/Stopped
        </Button>
      </div>

      <p className="text-xl font-medium text-white/90 mb-4 font-['DM_Mono',monospace]">
        {displayTotal}
        <span className="text-[13px] font-normal text-white/35 ml-1 font-['DM_Sans',sans-serif]">/month · {displayCount} SIPs</span>
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
    </GlassPanel>
  )
}
