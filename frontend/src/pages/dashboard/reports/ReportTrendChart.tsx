import { Activity } from "lucide-react";
import type { TrendReportRow } from "../../../types/report";

interface ReportTrendChartProps {
  data: TrendReportRow[];
}

export function ReportTrendChart({ data }: ReportTrendChartProps) {
  if (data.length === 0) return null;

  const maxRegs = Math.max(...data.map((d) => d.registration_count), 1);

  return (
    <div className="mb-8 p-6 bg-card border border-border rounded-xl">
      <h4 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Registration Chart
      </h4>
      <div className="space-y-4">
        {data.map((row, idx) => {
          const percentage = (row.registration_count / maxRegs) * 100;
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground text-right truncate">
                {row.period}
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="h-6 bg-primary/20 rounded overflow-hidden flex-1 max-w-2xl">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded"
                    style={{ width: `${Math.max(percentage, 1)}%` }}
                  />
                </div>
                <div className="w-12 shrink-0 text-sm font-bold tabular-nums">
                  {row.registration_count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
