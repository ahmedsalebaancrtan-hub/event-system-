import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterContext, ReportDataRow } from "../../types/report";

interface ExportActionsProps {
  reportData: ReportDataRow[];
  filterContext: FilterContext | null;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function ExportActions({
  reportData,
  filterContext,
  onExportCSV,
  onExportPDF,
}: ExportActionsProps) {
  if (reportData.length === 0 || !filterContext) return null;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onExportCSV} className="gap-2">
        <Download className="w-4 h-4" /> Export CSV
      </Button>
      <Button onClick={onExportPDF} className="gap-2">
        <FileText className="w-4 h-4" /> Export PDF
      </Button>
    </div>
  );
}
