import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import {
  type ReportFilterState,
  type ReportDataRow,
  type FilterContext,
  type BasicEvent,
  DEFAULT_REPORT_FILTERS,
} from "../types/report";

interface UseReportsReturn {
  filters: ReportFilterState;
  reportData: ReportDataRow[];
  filterContext: FilterContext | null;
  eventList: BasicEvent[];
  isLoading: boolean;
  error: string | null;
  handleFilterChange: (key: keyof ReportFilterState, value: string) => void;
  generateReport: () => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [filters, setFilters] = useState<ReportFilterState>(DEFAULT_REPORT_FILTERS);
  const [reportData, setReportData] = useState<ReportDataRow[]>([]);
  const [filterContext, setFilterContext] = useState<FilterContext | null>(null);
  const [eventList, setEventList] = useState<BasicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch approved events for the Details dropdown on mount
  useEffect(() => {
    api
      .get("/events/approved-event")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setEventList(
            res.data.data.map((e: { id: number; title: string; capacity: number }) => ({
              id: e.id,
              title: e.title,
              capacity: e.capacity,
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof ReportFilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const generateReport = useCallback(async () => {
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

      // Custom date range overrides year/month selectors
      if (filters.startDate || filters.endDate) {
        if (filters.startDate) params.append("start_date", filters.startDate);
        if (filters.endDate) params.append("end_date", filters.endDate);
      } else {
        if (filters.year && filters.year !== "0") params.append("year", filters.year);
        if (filters.month && filters.month !== "0") params.append("month", filters.month);
      }

      if (filters.category !== "all") params.append("category", filters.category);

      const res = await api.get(`/admin/reports?${params.toString()}`);

      if (res.data.success) {
        setReportData(res.data.data ?? []);
        setFilterContext(res.data.filter_context);
      } else {
        setError(res.data.message ?? "Failed to generate report");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Error generating report";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return {
    filters,
    reportData,
    filterContext,
    eventList,
    isLoading,
    error,
    handleFilterChange,
    generateReport,
  };
}
