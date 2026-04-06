import type { SipRowProps } from "./types/Dashboard.components.types"
import { SIP_STATUS_STYLES, SIP_STATUS_LABEL } from "./constants/Dashboard.constants"

export function SipRow({ sip }: SipRowProps) {
  const statusLabel = sip.status === "closed" && sip.runtime
    ? `${SIP_STATUS_LABEL[sip.status]} · ${sip.runtime}`
    : SIP_STATUS_LABEL[sip.status]

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
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SIP_STATUS_STYLES[sip.status]}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  )
}
