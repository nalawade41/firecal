import { useMemo } from "react"
import type { AllocationSegment, DonutArc, UseDonutChartReturn } from "../types/Dashboard.components.types"

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const START_OFFSET = -CIRCUMFERENCE * 0.25

export function useDonutChart(segments: AllocationSegment[]): UseDonutChartReturn {
  const arcs = useMemo(
    () =>
      segments.reduce<{ arcs: DonutArc[]; cursor: number }>(
        (acc, seg) => {
          const dash = (seg.percent / 100) * CIRCUMFERENCE
          const gap = CIRCUMFERENCE - dash
          acc.arcs.push({ label: seg.label, color: seg.color, dash, gap, offset: acc.cursor })
          return { arcs: acc.arcs, cursor: acc.cursor + dash }
        },
        { arcs: [], cursor: START_OFFSET },
      ).arcs,
    [segments],
  )

  return { arcs }
}
