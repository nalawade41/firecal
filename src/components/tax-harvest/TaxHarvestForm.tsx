import type { TaxHarvestFormProps } from "./types/TaxHarvestForm.types"
import { useTaxHarvestForm } from "./hooks/useTaxHarvestForm"
import { FundInfoSection } from "./sections/FundInfoSection"
import { TaxSettingsSection } from "./sections/TaxSettingsSection"
import { TransactionsSection } from "./sections/TransactionsSection"

export function TaxHarvestForm({ onCalculate }: TaxHarvestFormProps) {
  const {
    // Fund info
    amc, schemeCode, currentNav,
    isLoadingSchemes, isLoadingNav, schemeError, navError,
    filteredSchemes, searchQuery, isDropdownOpen, dropdownRef,
    onAmcChange, onFundChange, onNavChange, onRefreshSchemes,
    onSearchQueryChange, onToggleDropdown, onCloseDropdown,
    // Tax settings
    fyStartDate, fyEndDate, ltcgLimit,
    alreadyRealizedLTCG, alreadyRealizedSTCG,
    longTermMonths, exitLoadMonths, exitLoadPercent,
    onFyStartDateChange, onFyEndDateChange, onLtcgLimitChange,
    onAlreadyRealizedLTCGChange, onAlreadyRealizedSTCGChange,
    onLongTermMonthsChange, onExitLoadMonthsChange, onExitLoadPercentChange,
    // Transactions
    transactions, fileInputRef,
    onAddTransaction, onRemoveTransaction, onUpdateTransaction,
    onFileImport, onCalculate: handleCalculate,
  } = useTaxHarvestForm(onCalculate)

  return (
    <div className="space-y-6">
      <FundInfoSection
        amc={amc}
        schemeCode={schemeCode}
        currentNav={currentNav}
        isLoadingSchemes={isLoadingSchemes}
        isLoadingNav={isLoadingNav}
        schemeError={schemeError}
        navError={navError}
        filteredSchemes={filteredSchemes}
        searchQuery={searchQuery}
        isDropdownOpen={isDropdownOpen}
        dropdownRef={dropdownRef}
        onAmcChange={onAmcChange}
        onFundChange={onFundChange}
        onNavChange={onNavChange}
        onRefreshSchemes={onRefreshSchemes}
        onSearchQueryChange={onSearchQueryChange}
        onToggleDropdown={onToggleDropdown}
        onCloseDropdown={onCloseDropdown}
      />

      <TaxSettingsSection
        fyStartDate={fyStartDate}
        fyEndDate={fyEndDate}
        ltcgLimit={ltcgLimit}
        alreadyRealizedLTCG={alreadyRealizedLTCG}
        alreadyRealizedSTCG={alreadyRealizedSTCG}
        longTermMonths={longTermMonths}
        exitLoadMonths={exitLoadMonths}
        exitLoadPercent={exitLoadPercent}
        onFyStartDateChange={onFyStartDateChange}
        onFyEndDateChange={onFyEndDateChange}
        onLtcgLimitChange={onLtcgLimitChange}
        onAlreadyRealizedLTCGChange={onAlreadyRealizedLTCGChange}
        onAlreadyRealizedSTCGChange={onAlreadyRealizedSTCGChange}
        onLongTermMonthsChange={onLongTermMonthsChange}
        onExitLoadMonthsChange={onExitLoadMonthsChange}
        onExitLoadPercentChange={onExitLoadPercentChange}
      />

      <TransactionsSection
        transactions={transactions}
        amc={amc}
        fileInputRef={fileInputRef}
        onAddTransaction={onAddTransaction}
        onRemoveTransaction={onRemoveTransaction}
        onUpdateTransaction={onUpdateTransaction}
        onFileImport={onFileImport}
        onCalculate={handleCalculate}
      />
    </div>
  )
}
