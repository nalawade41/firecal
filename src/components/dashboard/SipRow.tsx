import type { SipRowView } from "@/types/dashboard"

interface SipRowProps {
  sip: SipRowView
}

export function SipRow({ sip }: SipRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: sip.dotColor }} />
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-white/80 truncate">{sip.label}</span>
          {sip.sublabel && (
            <span 
              className="text-[10px] shrink-0" 
              style={{ color: sip.sublabelColor || 'rgba(255,255,255,0.4)' }}
            >
              ({sip.sublabel})
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] font-medium text-white/80">{sip.amount}</span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            sip.status === "processed"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              : sip.status === "closed"
                ? "bg-red-500/15 text-red-400 border-red-500/20"
                : "bg-amber-500/15 text-amber-400 border-amber-500/20"
          }`}
        >
          {sip.status === "processed" ? "Processed" : sip.status === "closed" ? `Closed · ${sip.runtime || ""}` : "Pending"}
        </span>
      </div>
    </div>
  )
}
