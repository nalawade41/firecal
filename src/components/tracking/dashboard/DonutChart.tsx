import type { DonutChartProps } from "./types/Dashboard.components.types"

export function DonutChart({ arcs, centerLabel, centerValue }: DonutChartProps) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(74,102,84,.15)" strokeWidth="16" />
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke={arc.color}
          strokeWidth="16"
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset}
          transform="rotate(-90 48 48)"
        />
      ))}
      <text x="48" y="44" textAnchor="middle" fontSize="9" fill="rgba(138,168,150,.8)" fontFamily="system-ui">
        {centerLabel}
      </text>
      <text x="48" y="55" textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff" fontFamily="system-ui">
        {centerValue}
      </text>
    </svg>
  )
}
