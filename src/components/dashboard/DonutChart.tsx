import type { AllocationSegment } from "@/types/dashboard"

interface DonutChartProps {
  segments: AllocationSegment[]
  centerLabel: string
  centerValue: string
}

export function DonutChart({ segments, centerLabel, centerValue }: DonutChartProps) {
  const circumference = 2 * Math.PI * 36 // r=36
  const startOffset = -circumference * 0.25 // start at top

  const arcs = segments.reduce<{ seg: AllocationSegment; dash: number; gap: number; offset: number }[]>(
    (acc, seg) => {
      const dash = (seg.percent / 100) * circumference
      const gap = circumference - dash
      const prevEnd = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : startOffset
      acc.push({ seg, dash, gap, offset: prevEnd })
      return acc
    },
    [],
  )

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(74,102,84,.15)" strokeWidth="16" />
      {arcs.map(({ seg, dash, gap, offset }) => (
        <circle
          key={seg.label}
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke={seg.color}
          strokeWidth="16"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={-offset}
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
