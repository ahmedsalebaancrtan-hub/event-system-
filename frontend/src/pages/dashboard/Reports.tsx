import { BarChart3, FileText, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { useReports } from "../../hooks/useReports";
import { ReportFilterToolbar } from "../../features/reports/ReportFilterToolbar";
import { ReportSummaryCards } from "../../features/reports/ReportSummaryCards";
import { ReportTrendChart } from "../../features/reports/ReportTrendChart";
import { ReportPreviewTable } from "../../features/reports/ReportPreviewTable";
import { ExportActions } from "../../features/reports/ExportActions";

import {
  downloadCSV,
  downloadPDF,
  capitalize,
  titleCase,
  isoDate,
} from "../../services/export-utils";
import type {
  AttendeeReportRow,
  EventReportRow,
  TrendReportRow,
} from "../../types/report";

export const Reports = () => {
  const {
    filters,
    reportData,
    filterContext,
    eventList,
    isLoading,
    error,
    handleFilterChange,
    generateReport,
  } = useReports();

  const isDetails = filters.type === "details";
  const isTrends = filters.type === "trends";

  const buildSubtitle = () => {
    if (!filterContext) return "";
    const parts = [];

    if (filterContext.start_date || filterContext.end_date) {
      parts.push(
        `Date Range: ${filterContext.start_date || "Any"} to ${
          filterContext.end_date || "Any"
        }`
      );
    } else if (filterContext.year || filterContext.month) {
      const mName =
        filterContext.month > 0
          ? new Date(2000, filterContext.month - 1).toLocaleString("default", {
              month: "long",
            })
          : "All Months";
      const yName = filterContext.year > 0 ? filterContext.year : "All Years";
      parts.push(`Period: ${mName} ${yName}`);
    }

    if (filterContext.category && filterContext.category !== "all") {
      parts.push(`Category: ${titleCase(filterContext.category)}`);
    }

    if (filterContext.type === "performance" && filterContext.sort_by) {
      const sortMap: Record<string, string> = {
        most_registered: "Most Registered",
        highest_fill_rate: "Highest Fill Rate",
        lowest_fill_rate: "Lowest Fill Rate",
        newest: "Newest Events",
        oldest: "Oldest Events",
      };
      parts.push(`Sorted By: ${sortMap[filterContext.sort_by] || "Custom"}`);
    }

    if (filterContext.type === "details" && filterContext.event_id) {
      const evt = eventList.find((e) => e.id === filterContext.event_id);
      parts.push(`Event: ${evt?.title || `ID #${filterContext.event_id}`}`);
    }

    return parts.join(" | ") || "All Data";
  };

  const handleExportCSV = () => {
    if (reportData.length === 0 || !filterContext) return;

    let headers: string[];
    let rows: (string | number)[][];

    if (isDetails) {
      headers = [
        "Participant",
        "Email",
        "Phone",
        "Registration Date",
        "Status",
        "Event Title",
      ];
      rows = (reportData as AttendeeReportRow[]).map((r) => [
        r.guest_name,
        r.guest_email,
        r.guest_phone || "N/A",
        new Date(r.event_start_time).toLocaleDateString(),
        capitalize(r.reg_status),
        r.event_title,
      ]);
    } else if (isTrends) {
      headers = ["Period", "Event Count", "Registration Count"];
      rows = (reportData as TrendReportRow[]).map((r) => [
        r.period,
        r.event_count,
        r.registration_count,
      ]);
    } else {
      headers = [
        "Event",
        "Event Type",
        "Status",
        "Total Capacity",
        "Registrations",
        "Available Seats",
        "Fill Rate",
        "Location",
        "Start Date",
        "End Date",
      ];
      rows = (reportData as EventReportRow[]).map((r) => [
        r.title,
        titleCase(r.type),
        capitalize(r.status),
        r.capacity,
        r.registration_count,
        r.available_seats,
        `${r.fill_rate.toFixed(1)}%`,
        r.location,
        new Date(r.start_time).toLocaleDateString(),
        new Date(r.end_time).toLocaleDateString(),
      ]);
    }

    const filename = `Report_${filterContext.type}_${isoDate()}.csv`;
    downloadCSV(headers, rows, filename);
  };

  const handleExportPDF = () => {
    if (reportData.length === 0 || !filterContext) return;

    let columns: { header: string; dataKey: string }[];
    let rows: Record<string, string | number>[];

    if (isDetails) {
      columns = [
        { header: "Participant", dataKey: "guestName" },
        { header: "Email", dataKey: "email" },
        { header: "Status", dataKey: "status" },
        { header: "Event", dataKey: "event" },
      ];
      rows = (reportData as AttendeeReportRow[]).map((r) => ({
        guestName: r.guest_name,
        email: r.guest_email,
        status: capitalize(r.reg_status),
        event: r.event_title,
      }));
    } else if (isTrends) {
      columns = [
        { header: "Period", dataKey: "period" },
        { header: "Events", dataKey: "events" },
        { header: "Registrations", dataKey: "regs" },
      ];
      rows = (reportData as TrendReportRow[]).map((r) => ({
        period: r.period,
        events: r.event_count,
        regs: r.registration_count,
      }));
    } else {
      columns = [
        { header: "Event", dataKey: "title" },
        { header: "Category", dataKey: "type" },
        { header: "Location", dataKey: "location" },
        { header: "Capacity", dataKey: "capacity" },
        { header: "Regs", dataKey: "regs" },
        { header: "Available", dataKey: "avail" },
        { header: "Fill Rate", dataKey: "fillRate" },
        { header: "Start Date", dataKey: "date" },
        { header: "Status", dataKey: "status" },
      ];
      rows = (reportData as EventReportRow[]).map((r) => ({
        title: r.title,
        type: titleCase(r.type),
        location: r.location,
        capacity: r.capacity,
        regs: r.registration_count,
        avail: r.available_seats,
        fillRate: `${r.fill_rate.toFixed(1)}%`,
        date: new Date(r.start_time).toLocaleDateString(),
        status: capitalize(r.status),
      }));
    }

    let reportTitle = "Event Performance Report";
    if (filterContext.type === "trends") reportTitle = "Registration Trends";
    if (filterContext.type === "details")
      reportTitle = "Event Registration Details";

    downloadPDF({
      title: reportTitle,
      subtitle: buildSubtitle(),
      columns,
      rows,
      filename: `Report_${filterContext.type}_${isoDate()}.pdf`,
      summaryItems: [{ label: "Total Records", value: filterContext.total }],
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate actionable reports from event activity.
          </p>
        </div>
        <ExportActions
          reportData={reportData}
          filterContext={filterContext}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* ── Filter Toolbar ─────────────────────────────────────── */}
      <ReportFilterToolbar
        filters={filters}
        eventList={eventList}
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onGenerate={generateReport}
      />

      {/* ── Summary Stats ──────────────────────────────────────── */}
      {filterContext && (
        <ReportSummaryCards
          filterContext={filterContext}
          eventList={eventList}
        />
      )}

      {/* ── Data Preview ───────────────────────────────────────── */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="font-semibold text-lg">
              {filterContext?.type === "performance" && "Event Performance"}
              {filterContext?.type === "trends" && "Registration Trends"}
              {filterContext?.type === "details" &&
                "Event Registration Details"}
              {!filterContext && "Data Preview"}
            </h3>
            {filterContext && (
              <p className="text-sm text-muted-foreground mt-1">
                {buildSubtitle()}
              </p>
            )}
          </div>
          {filterContext && (
            <Badge variant="secondary" className="mt-2 sm:mt-0">
              {filterContext.total} Records Found
            </Badge>
          )}
        </div>

        {filterContext?.type === "trends" && (
          <div className="p-4">
            <ReportTrendChart data={reportData as TrendReportRow[]} />
          </div>
        )}

        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !filterContext ? (
          <div className="py-20 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              Configure your filters and click "Generate Report"
            </p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold">No Data Found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              No events or registrations match the selected filters.
            </p>
          </div>
        ) : (
          <ReportPreviewTable
            type={filterContext.type}
            data={reportData}
          />
        )}
      </Card>
    </div>
  );
};
