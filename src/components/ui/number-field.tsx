import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  suffix?: string
  min?: number
  max?: number
  step?: number
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80">
        {label}
        {suffix && <span className="text-muted-foreground ml-1">({suffix})</span>}
      </Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="bg-white/60 backdrop-blur-sm"
      />
    </div>
  )
}
