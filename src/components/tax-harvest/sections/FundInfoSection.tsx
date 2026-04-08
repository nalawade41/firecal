import { Label } from "@/components/ui/label"
import { NumberField } from "@/components/ui/number-field"
import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/ui/glass-panel"
import { AlertPanel } from "@/components/ui/alert-panel"
import { ChevronDown, Search, Loader2 } from "lucide-react"

import type { FundInfoSectionProps } from "../types/TaxHarvestForm.types"
import { AMC_OPTIONS } from "../constants/TaxHarvestForm.constants"
import { toTitleCase } from "../utils/toTitleCase"

export function FundInfoSection({
  amc,
  schemeCode,
  currentNav,
  isLoadingSchemes,
  isLoadingNav,
  schemeError,
  navError,
  filteredSchemes,
  searchQuery,
  isDropdownOpen,
  dropdownRef,
  onAmcChange,
  onFundChange,
  onNavChange,
  onRefreshSchemes,
  onSearchQueryChange,
  onToggleDropdown,
  onCloseDropdown,
}: FundInfoSectionProps) {
  const selectedSchemeName = schemeCode
    ? toTitleCase(filteredSchemes.find(s => s.schemeCode === schemeCode)?.schemeName || "")
    : isLoadingSchemes
      ? "Loading funds..."
      : filteredSchemes.length === 0
        ? "No funds found"
        : "Select a fund"

  return (
    <GlassPanel
      title="Fund Information"
      description="Enter fund details and current NAV"
      className="relative z-30"
      headerAction={
        <Button variant="link" size="xs" onClick={onRefreshSchemes} disabled={isLoadingSchemes}>
          {isLoadingSchemes ? "Loading..." : "Refresh"}
        </Button>
      }
    >
      {schemeError && (
        <AlertPanel variant="red">{schemeError}</AlertPanel>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* AMC Select */}
        <div className="space-y-2 min-w-0">
          <Label>AMC (Fund House)</Label>
          <select
            value={amc}
            onChange={(e) => onAmcChange(e.target.value as typeof amc)}
            className="wt-form-input w-full h-10"
          >
            {AMC_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Fund Dropdown */}
        <div className="space-y-2 min-w-0" ref={dropdownRef}>
          <Label>Fund Name</Label>
          <div className="relative">
            <button
              type="button"
              onClick={onToggleDropdown}
              disabled={isLoadingSchemes || filteredSchemes.length === 0}
              className="wt-form-input w-full h-10 flex items-center justify-between text-left disabled:opacity-50"
            >
              <span className="truncate">{selectedSchemeName}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--wt-ink3)]" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-[100] w-full mt-1 wt-glass rounded-[var(--wt-r)] shadow-lg max-h-60 overflow-auto">
                <div className="sticky top-0 bg-[var(--wt-mist)] p-2 border-b border-[var(--wt-divider)]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--wt-ink3)]" />
                    <input
                      type="text"
                      placeholder="Search funds..."
                      value={searchQuery}
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      className="wt-form-input w-full pl-9 pr-3 py-2"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="py-1">
                  {filteredSchemes
                    .filter(scheme =>
                      scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((scheme) => (
                      <button
                        key={scheme.schemeCode}
                        type="button"
                        onClick={() => {
                          onFundChange(scheme.schemeName, scheme.schemeCode)
                          onCloseDropdown()
                          onSearchQueryChange("")
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--wt-foam)] transition-colors ${
                          schemeCode === scheme.schemeCode
                            ? 'bg-[var(--wt-green-light)] text-[var(--wt-green)]'
                            : 'text-[var(--wt-ink)]'
                        }`}
                      >
                        {toTitleCase(scheme.schemeName)}
                      </button>
                    ))}
                  {filteredSchemes.filter(scheme =>
                    scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-[var(--wt-ink3)] text-center">
                      No funds found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current NAV */}
        <div className="min-w-0">
          <NumberField
            label="Current NAV"
            value={currentNav}
            onChange={onNavChange}
            suffix="₹"
            step={0.01}
          />
          {isLoadingNav && (
            <p className="text-xs text-[var(--wt-blue)] mt-1 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Fetching NAV...
            </p>
          )}
          {navError && (
            <p className="text-xs text-[var(--wt-red)] mt-1">{navError}</p>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
