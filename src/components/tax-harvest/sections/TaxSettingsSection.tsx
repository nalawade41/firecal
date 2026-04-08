import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { NumberField } from "@/components/ui/number-field"
import { GlassPanel } from "@/components/ui/glass-panel"

import type { TaxSettingsSectionProps } from "../types/TaxHarvestForm.types"

export function TaxSettingsSection({
  fyStartDate,
  fyEndDate,
  ltcgLimit,
  alreadyRealizedLTCG,
  alreadyRealizedSTCG,
  longTermMonths,
  exitLoadMonths,
  exitLoadPercent,
  onFyStartDateChange,
  onFyEndDateChange,
  onLtcgLimitChange,
  onAlreadyRealizedLTCGChange,
  onAlreadyRealizedSTCGChange,
  onLongTermMonthsChange,
  onExitLoadMonthsChange,
  onExitLoadPercentChange,
}: TaxSettingsSectionProps) {
  return (
    <GlassPanel
      title="Tax Settings"
      description="Configure financial year and exemption limits"
      className="relative z-20"
    >
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>FY Start Date</Label>
          <Input
            type="date"
            value={fyStartDate}
            onChange={(e) => onFyStartDateChange(e.target.value)}
            className="wt-form-input"
          />
        </div>
        <div className="space-y-2">
          <Label>FY End Date</Label>
          <Input
            type="date"
            value={fyEndDate}
            onChange={(e) => onFyEndDateChange(e.target.value)}
            className="wt-form-input"
          />
        </div>
        <NumberField
          label="LTCG Exemption Limit"
          value={ltcgLimit}
          onChange={onLtcgLimitChange}
          suffix="₹"
          step={1000}
        />
        <NumberField
          label="Already Realized LTCG"
          value={alreadyRealizedLTCG}
          onChange={onAlreadyRealizedLTCGChange}
          suffix="₹"
          step={1000}
        />
        <NumberField
          label="Already Realized STCG"
          value={alreadyRealizedSTCG}
          onChange={onAlreadyRealizedSTCGChange}
          suffix="₹"
          step={1000}
        />
        <NumberField
          label="Long-term Period"
          value={longTermMonths}
          onChange={onLongTermMonthsChange}
          suffix="months"
          step={1}
          min={1}
        />
        <NumberField
          label="Exit Load Period"
          value={exitLoadMonths}
          onChange={onExitLoadMonthsChange}
          suffix="months"
          step={1}
          min={0}
        />
        <NumberField
          label="Exit Load %"
          value={exitLoadPercent}
          onChange={onExitLoadPercentChange}
          suffix="%"
          step={0.01}
          min={0}
        />
      </div>
    </GlassPanel>
  )
}
