import type { StepProps } from "@/types/onboarding"
import { NumberField } from "@/components/ui/number-field"

export function StepProfile({ data, updateData }: StepProps) {
  function update<K extends keyof typeof data.profile>(key: K, value: typeof data.profile[K]) {
    updateData({ profile: { ...data.profile, [key]: value } })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberField
          label="Current Age"
          value={data.profile.currentAge}
          onChange={(v) => update("currentAge", v)}
          min={18}
          max={100}
        />
        <NumberField
          label="Retirement Age"
          value={data.profile.retirementAge}
          onChange={(v) => update("retirementAge", v)}
          min={30}
          max={100}
        />
        <NumberField
          label="Life Expectancy"
          value={data.profile.lifeExpectancy}
          onChange={(v) => update("lifeExpectancy", v)}
          min={50}
          max={120}
        />
        <NumberField
          label="Number of Children"
          value={data.profile.numberOfChildren}
          onChange={(v) => update("numberOfChildren", v)}
          min={0}
          max={10}
        />
      </div>
    </div>
  )
}
