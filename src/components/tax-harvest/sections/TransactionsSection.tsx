import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/ui/glass-panel"
import { Plus, Upload, Calculator } from "lucide-react"

import type { TransactionsSectionProps } from "../types/TaxHarvestForm.types"
import { TransactionRow } from "./TransactionRow"

export function TransactionsSection({
  transactions,
  amc,
  fileInputRef,
  onAddTransaction,
  onRemoveTransaction,
  onUpdateTransaction,
  onFileImport,
  onCalculate,
}: TransactionsSectionProps) {
  const fileAccept = amc === "axis" ? ".csv,.pdf" : ".csv"
  const importLabel = amc === "axis" ? "Import CSV/PDF" : "Import CSV"

  return (
    <GlassPanel
      title={`Transactions${transactions.length > 0 ? ` (${transactions.length} total)` : ""}`}
      description={`Add buy, SIP, sell transactions or import from ${importLabel.toLowerCase().replace("import ", "")}`}
      headerAction={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="wt-btn-glass">
            <Upload className="h-4 w-4" />
            {importLabel}
          </Button>
          <input ref={fileInputRef} type="file" accept={fileAccept} className="hidden" onChange={onFileImport} />
          <Button variant="outline" size="sm" onClick={onAddTransaction} className="wt-btn-glass">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
          <Button size="sm" onClick={onCalculate} disabled={transactions.length === 0} className="wt-btn wt-btn-primary">
            <Calculator className="h-4 w-4" />
            Calculate
          </Button>
        </div>
      }
    >
      {transactions.length === 0 ? (
        <p className="wt-hint text-center py-8">
          No transactions added yet. Add manually or import from {importLabel.toLowerCase().replace("import ", "")}.
        </p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
          {transactions.map((tx, idx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              index={idx}
              onUpdate={onUpdateTransaction}
              onRemove={onRemoveTransaction}
            />
          ))}
        </div>
      )}
    </GlassPanel>
  )
}
