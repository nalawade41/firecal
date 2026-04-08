import { Button } from "@/components/ui/button"
import { Calculator, Download, Upload } from "lucide-react"
import type { ActionButtonsSectionProps } from "../types/FireForm.types"

export function ActionButtonsSection({ fileInputRef, handleExport, handleImport, handleCalculate }: ActionButtonsSectionProps) {
  return (
    <div className="flex justify-center gap-3 pt-4 flex-wrap">
      <Button
        variant="outline"
        size="lg"
        onClick={handleExport}
        className="text-base"
      >
        <Download className="h-5 w-5 mr-2" />
        Export
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => fileInputRef.current?.click()}
        className="text-base"
      >
        <Upload className="h-5 w-5 mr-2" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <Button
        size="lg"
        onClick={handleCalculate}
        className="px-12 text-base shadow-lg"
      >
        <Calculator className="h-5 w-5 mr-2" />
        Calculate FIRE Plan
      </Button>
    </div>
  )
}
