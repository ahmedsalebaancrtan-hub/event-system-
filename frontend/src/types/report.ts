// Types for the Reports & Analytics module.

export type ReportType = "performance" | "trends" | "details";

export interface ReportFilterState {
  type: ReportType;
  sortBy: string;
  eventId: string;
  year: string;
  month: string;
  startDate: string;
  endDate: string;
  category: string;
}

export const DEFAULT_REPORT_FILTERS: ReportFilterState = {
  type: "performance",
  sortBy: "most_registered",
  eventId: "0",
  year: new Date().getFullYear().toString(),
  month: "0",
  startDate: "",
  endDate: "",
  category: "all",
};

// ── API row shapes ─────────────────────────────────────────────

export interface EventReportRow {
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

export interface TrendReportRow {
  period: string;
  event_count: number;
  registration_count: number;
}

export interface AttendeeReportRow {
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

export type ReportDataRow = EventReportRow | TrendReportRow | AttendeeReportRow;

export interface FilterContext {
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
}

export interface BasicEvent {
  id: number;
  title: string;
  capacity: number;
}

// ── Column definitions for PDF export ─────────────────────────

export interface PdfColumnDef {
  header: string;
  dataKey: string;
}
