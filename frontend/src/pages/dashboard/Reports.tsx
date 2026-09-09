import { useState, useEffect } from "react";
import {
  FileText,
  BarChart3,
  Download,
  Search,
  AlertCircle,
  Calendar as CalendarIcon,
  Users,
  Percent,
  CheckCircle,
  Activity
} from "lucide-react";
import { api } from "../../lib/api";
import {
  downloadCSV,
  downloadPDF,
  capitalize,
  titleCase,
  isoDate,
} from "../../lib/export-utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
type ReportType = "performance" | "trends" | "details";

interface ReportFilterState {
  type: ReportType;
  sortBy: string;
  eventId: string;
  year: string;
  month: string;
  startDate: string;
  endDate: string;
  category: string;
}

const DEFAULT_FILTERS: ReportFilterState = {
  type: "performance",
  sortBy: "most_registered",
  eventId: "0",
  year: new Date().getFullYear().toString(),
  month: "0", // Default to all months
  startDate: "",
  endDate: "",
  category: "all",
};

// Data returned by backend
interface EventReportRow {
  id: number;
  title: string;
  type: string;
  location: string;
  capacity: number;
  registration_count: number;
  available_seats: number;
  fill_rate: number;
  start_time: string;
  end_time: string;
  status: string;
}

interface TrendReportRow {
  period: string;
  event_count: number;
  registration_count: number;
}

interface AttendeeReportRow {
  registration_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  reg_status: string;
  event_id: number;
  event_title: string;
  event_type: string;
  event_location: string;
  event_start_time: string;
  event_status: string;
}

interface FilterContext {
  type: string;
  sort_by: string;
  event_id: number;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  category: string;
  total: number;
  total_events?: number;
  total_registrations?: number;
  average_fill_rate?: number;
  events_near_capacity?: number;
  avg_reg_per_event?: number;
  most_popular_event?: string;
  most_popular_category?: string;
}

interface BasicEvent {
  id: number;
  title: string;
  capacity: number;
}

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "approved") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 uppercase tracking-wide text-[10px] font-bold"
      >
        Approved
      </Badge>
    );
  }
  if (status === "pending") {
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
};

export const Reports = () => {
  const [filters, setFilters] = useState<ReportFilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reportData, setReportData] = useState<
    EventReportRow[] | AttendeeReportRow[] | TrendReportRow[]
  >([]);
  const [filterContext, setFilterContext] = useState<FilterContext | null>(
    null
  );

  const [eventList, setEventList] = useState<BasicEvent[]>([]);

  const isPerformance = filterContext?.type === "performance";
  const isTrends = filterContext?.type === "trends";
  const isDetails = filterContext?.type === "details";

  useEffect(() => {
    // Fetch all approved events for the dropdown
    api.get('/events/approved-event').then(res => {
      if (res.data.success) {
        setEventList(res.data.data.map((e: any) => ({ id: e.id, title: e.title, capacity: e.capacity })));
      }
    }).catch(console.error);
  }, []);

  const handleFilterChange = (key: keyof ReportFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("type", filters.type);

      if (filters.type === "details" && filters.eventId !== "0") {
        params.append("event_id", filters.eventId);
      }

      if (filters.type === "performance") {
        params.append("sort_by", filters.sortBy);
      }

      // Only apply year/month if start_date/end_date are not set
      if (!filters.startDate && !filters.endDate) {
        if (filters.year && filters.year !== "0") params.append("year", filters.year);
        if (filters.month && filters.month !== "0") params.append("month", filters.month);
      } else {
        if (filters.startDate) params.append("start_date", filters.startDate);
        if (filters.endDate) params.append("end_date", filters.endDate);
      }

      if (filters.category !== "all") params.append("category", filters.category);

      const res = await api.get(`/admin/reports?${params.toString()}`);
      if (res.data.success) {
        setReportData(res.data.data);
        setFilterContext(res.data.filter_context);
      } else {
        setError(res.data.message || "Failed to generate report");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error generating report"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      const evt = eventList.find(e => e.id === filterContext.event_id);
      parts.push(`Event: ${evt?.title || `ID #${filterContext.event_id}`}`);
    }

    return parts.join(" | ") || "All Data";
  };

  const handleExportCSV = () => {
    if (reportData.length === 0 || !filterContext) return;

    let headers: string[];
    let rows: any[][];

    if (isDetails) {
      headers = [
        "Participant",
        "Email",
        "Phone",
        "Registration Date",
        "Status",
        "Event Title"
      ];
      rows = (reportData as AttendeeReportRow[]).map((r) => [
        r.guest_name,
        r.guest_email,
        r.guest_phone || "N/A",
        new Date(r.event_start_time).toLocaleDateString(), // Should ideally be reg created_at, using event start for now if created_at absent
        capitalize(r.reg_status),
        r.event_title
      ]);
    } else if (isTrends) {
       headers = [
        "Period",
        "Event Count",
        "Registration Count"
       ];
       rows = (reportData as TrendReportRow[]).map((r) => [
         r.period,
         r.event_count,
         r.registration_count
       ]);
    } else {
      // Performance
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

    let columns: any[];
    let rows: any[];

    if (isDetails) {
      columns = [
        { header: "Participant", dataKey: "guestName" },
        { header: "Email", dataKey: "email" },
        { header: "Status", dataKey: "status" },
        { header: "Event", dataKey: "event" }
      ];
      rows = (reportData as AttendeeReportRow[]).map((r) => ({
        guestName: r.guest_name,
        email: r.guest_email,
        status: capitalize(r.reg_status),
        event: r.event_title
      }));
    } else if (isTrends) {
      columns = [
        { header: "Period", dataKey: "period" },
        { header: "Events", dataKey: "events" },
        { header: "Registrations", dataKey: "regs" }
      ];
      rows = (reportData as TrendReportRow[]).map((r) => ({
        period: r.period,
        events: r.event_count,
        regs: r.registration_count
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
    if (filterContext.type === "details") reportTitle = "Event Registration Details";

    downloadPDF({
      title: reportTitle,
      subtitle: buildSubtitle(),
      columns,
      rows,
      filename: `Report_${filterContext.type}_${isoDate()}.pdf`,
      summaryItems: [
        { label: "Total Records", value: filterContext.total },
      ],
    });
  };

  // UI rendering blocks
  const renderSummaryCards = () => {
    if (!filterContext) return null;

    let items: { label: string; value: string | number; icon: any }[] = [];

    if (isPerformance) {
      items = [
        { label: "Total Events", value: filterContext.total_events || 0, icon: CalendarIcon },
        { label: "Registrations", value: filterContext.total_registrations || 0, icon: Users },
        { label: "Avg Fill Rate", value: `${(filterContext.average_fill_rate || 0).toFixed(1)}%`, icon: Percent },
        { label: "Near Capacity", value: filterContext.events_near_capacity || 0, icon: AlertCircle },
      ];
    } else if (isTrends) {
      items = [
        { label: "Total Registrations", value: filterContext.total_registrations || 0, icon: Users },
        { label: "Total Events", value: filterContext.total_events || 0, icon: CalendarIcon },
        { label: "Avg Regs/Event", value: (filterContext.avg_reg_per_event || 0).toFixed(1), icon: Activity },
        { label: "Peak Period", value: filterContext.most_popular_event || "N/A", icon: BarChart3 },
      ];
    } else if (isDetails) {
      const selectedEvent = eventList.find(e => e.id === filterContext.event_id);
      const capacity = selectedEvent?.capacity || 0;
      const regs = filterContext.total_registrations || 0;
      const avail = Math.max(0, capacity - regs);
      const fill = capacity > 0 ? ((regs / capacity) * 100).toFixed(1) : "0.0";
      
      items = [
        { label: "Capacity", value: capacity, icon: Users },
        { label: "Registrations", value: regs, icon: CheckCircle },
        { label: "Available Seats", value: avail, icon: AlertCircle },
        { label: "Fill Rate", value: `${fill}%`, icon: Percent },
      ];
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {items.map((item, idx) => (
          <Card key={idx} className="bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTrendChart = () => {
    if (!isTrends || reportData.length === 0) return null;
    const data = reportData as TrendReportRow[];
    
    // Find max value for scaling
    const maxRegs = Math.max(...data.map(d => d.registration_count), 1);

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
                  <div className="h-6 bg-primary/20 rounded overflow-hidden flex-1 relative max-w-2xl">
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
        {(reportData.length > 0 && filterContext) && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button onClick={handleExportPDF} className="gap-2">
              <FileText className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* ── Filter Toolbar ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1: Primary Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
              
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Report Type
                </label>
                <Select
                  value={filters.type}
                  onValueChange={(v: ReportType) => handleFilterChange("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Event Performance</SelectItem>
                    <SelectItem value="trends">Registration Trends</SelectItem>
                    <SelectItem value="details">Event Registration Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DETAILS MODE: Event Selector */}
              {filters.type === "details" && (
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Event
                  </label>
                  <Select
                    value={filters.eventId}
                    onValueChange={(v) => handleFilterChange("eventId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Select an event...</SelectItem>
                      {eventList.map(e => (
                        <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* PERFORMANCE & TRENDS MODE: Category */}
              {filters.type !== "details" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Category
                  </label>
                  <Select
                    value={filters.category}
                    onValueChange={(v) => handleFilterChange("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="SEMINAR">Seminar</SelectItem>
                      <SelectItem value="CONFERENCE">Conference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* PERFORMANCE & TRENDS MODE: Year & Month */}
              {filters.type !== "details" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Year
                    </label>
                    <Select
                      value={filters.year}
                      onValueChange={(v) => handleFilterChange("year", v)}
                      disabled={!!filters.startDate || !!filters.endDate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Years</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2027">2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Month
                    </label>
                    <Select
                      value={filters.month}
                      onValueChange={(v) => handleFilterChange("month", v)}
                      disabled={!!filters.startDate || !!filters.endDate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Months</SelectItem>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(2000, i).toLocaleString("default", {
                              month: "long",
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* PERFORMANCE MODE ONLY: Sort By */}
              {filters.type === "performance" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Sort By
                  </label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(v) => handleFilterChange("sortBy", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most_registered">Most Registered</SelectItem>
                      <SelectItem value="highest_fill_rate">Highest Fill Rate</SelectItem>
                      <SelectItem value="lowest_fill_rate">Lowest Fill Rate</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Row 2: Custom Date & Action Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">From Date</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-[160px] text-xs"
                  />
                </div>
                <span className="text-sm text-muted-foreground self-end pb-2">to</span>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">To Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="w-[160px] text-xs"
                  />
                </div>
              </div>

              {/* Separate Action Button clearly */}
              <Button 
                onClick={generateReport} 
                className="sm:ml-auto w-full sm:w-auto h-10 px-6 bg-primary text-primary-foreground" 
                disabled={isLoading || (filters.type === 'details' && filters.eventId === '0')}
              >
                <Search className="w-4 h-4 mr-2"/>
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ── Summary Stats ──────────────────────────────────────── */}
      {renderSummaryCards()}

      {/* ── Data Preview ───────────────────────────────────────── */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="font-semibold text-lg">
              {filterContext?.type === 'performance' && 'Event Performance'}
              {filterContext?.type === 'trends' && 'Registration Trends'}
              {filterContext?.type === 'details' && 'Event Registration Details'}
              {!filterContext && 'Data Preview'}
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

        <div className="p-4">
          {renderTrendChart()}
        </div>

        <div className="overflow-x-auto pb-4 px-4">
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
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                  {isDetails ? (
                    <>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Participant</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Reg Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Event Date</TableHead>
                    </>
                  ) : isTrends ? (
                    <>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Period</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Events</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Registrations</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Category</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell">Venue</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Capacity</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Regs</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Available</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Fill Rate</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden xl:table-cell">Start Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right pr-4">Status</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDetails && (reportData as AttendeeReportRow[]).map((row) => (
                  <TableRow key={`att-${row.registration_id}`}>
                    <TableCell className="font-medium py-3">{row.guest_name}</TableCell>
                    <TableCell className="py-3 text-muted-foreground">{row.guest_email}</TableCell>
                    <TableCell className="py-3"><StatusBadge status={row.reg_status} /></TableCell>
                    <TableCell className="py-3 hidden sm:table-cell whitespace-nowrap text-muted-foreground text-sm">
                      {new Date(row.event_start_time).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}

                {isTrends && (reportData as TrendReportRow[]).map((row, idx) => (
                  <TableRow key={`trend-${idx}`}>
                    <TableCell className="font-medium py-3">{row.period}</TableCell>
                    <TableCell className="py-3 tabular-nums">{row.event_count}</TableCell>
                    <TableCell className="py-3 tabular-nums">{row.registration_count}</TableCell>
                  </TableRow>
                ))}

                {isPerformance && (reportData as EventReportRow[]).map((row) => (
                  <TableRow key={`evt-${row.id}`}>
                    <TableCell className="font-medium py-3 max-w-[200px] truncate" title={row.title}>
                      {row.title}
                      <span className="block text-xs text-muted-foreground md:hidden">{titleCase(row.type)}</span>
                    </TableCell>
                    <TableCell className="py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">{row.type}</Badge>
                    </TableCell>
                    <TableCell className="py-3 hidden lg:table-cell max-w-[150px] truncate" title={row.location}>
                      <span className="text-sm text-muted-foreground">{row.location}</span>
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">{row.capacity}</TableCell>
                    <TableCell className="py-3 text-sm tabular-nums font-medium">{row.registration_count}</TableCell>
                    <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">{row.available_seats}</TableCell>
                    <TableCell className="py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-[60px]">
                          <div
                            className={`h-full ${
                              row.fill_rate >= 100
                                ? "bg-destructive"
                                : row.fill_rate > 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(row.fill_rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium tabular-nums w-8">
                          {row.fill_rate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 whitespace-nowrap text-sm text-muted-foreground hidden xl:table-cell">
                      {new Date(row.start_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 text-right pr-4">
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};
