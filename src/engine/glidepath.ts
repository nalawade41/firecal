import type { GlidepathCheckpoint } from "@/types"

export function getEquityAllocation(
  age: number,
  checkpoints: GlidepathCheckpoint[]
): number {
  if (checkpoints.length === 0) {
    return 50 // default fallback
  }

  const sorted = [...checkpoints].sort((a, b) => a.age - b.age)

  // Before first checkpoint: hold first checkpoint's equity %
  if (age <= sorted[0].age) {
    return sorted[0].equityPercent
  }

  // After last checkpoint: hold last checkpoint's equity %
  if (age >= sorted[sorted.length - 1].age) {
    return sorted[sorted.length - 1].equityPercent
  }

  // Linear interpolation between two surrounding checkpoints
  for (let i = 0; i < sorted.length - 1; i++) {
    const lower = sorted[i]
    const upper = sorted[i + 1]

    if (age >= lower.age && age <= upper.age) {
      const ratio = (age - lower.age) / (upper.age - lower.age)
      return lower.equityPercent + ratio * (upper.equityPercent - lower.equityPercent)
    }
  }

  return sorted[sorted.length - 1].equityPercent
}
