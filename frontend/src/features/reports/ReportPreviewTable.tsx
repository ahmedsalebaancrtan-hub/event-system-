import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { capitalize, titleCase } from "../../services/export-utils";
import type {
  ReportDataRow,
  EventReportRow,
  AttendeeReportRow,
} from "../../types/report";

interface ReportPreviewTableProps {
  type: string;
  data: ReportDataRow[];
}

function StatusBadge({ status }: { status: string }) {
  if (status.toLowerCase() === "approved") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 uppercase tracking-wide text-[10px] font-bold"
      >
        Approved
      </Badge>
    );
  }
  if (status.toLowerCase() === "pending") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 text-amber-500 bg-amber-500/10 uppercase tracking-wide text-[10px] font-bold"
      >
        Pending
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-destructive/40 text-destructive bg-destructive/10 uppercase tracking-wide text-[10px] font-bold"
    >
      Rejected
    </Badge>
  );
}

export function ReportPreviewTable({ type, data }: ReportPreviewTableProps) {
  const isDetails = type === "details";
  const isTrends = type === "trends";

  return (
    <div className="overflow-x-auto pb-4 px-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
            {isDetails ? (
              <>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Participant
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Reg Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">
                  Event Date
                </TableHead>
              </>
            ) : isTrends ? (
              <>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Period
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">
                  Events
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">
                  Registrations
                </TableHead>
              </>
            ) : (
              <>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Event Title
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">
                  Capacity
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">
                  Registered
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">
                  Available
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">
                  Fill Rate
                </TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => {
            if (isDetails) {
              const r = row as AttendeeReportRow;
              return (
                <TableRow key={i} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {r.guest_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.guest_email}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.reg_status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {new Date(r.event_start_time).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            }

            if (isTrends) {
              const r = row as any;
              return (
                <TableRow key={i} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{r.period}</TableCell>
                  <TableCell className="text-right">
                    {r.event_count}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {r.registration_count}
                  </TableCell>
                </TableRow>
              );
            }

            // Performance
            const r = row as EventReportRow;
            return (
              <TableRow key={i} className="hover:bg-muted/30">
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {titleCase(r.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.capacity}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-primary">
                  {r.registration_count}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.available_seats}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span
                    className={
                      r.fill_rate >= 90
                        ? "text-emerald-500 font-bold"
                        : "text-muted-foreground"
                    }
                  >
                    {r.fill_rate.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
