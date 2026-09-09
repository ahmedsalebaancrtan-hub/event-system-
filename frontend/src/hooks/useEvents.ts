import { useState, useCallback, useMemo } from "react";
import { useEventStore } from "../store/event-store";
import type { AppEvent } from "../types/event";

export type EventTypeFilter = "CONFERENCE" | "WORKSHOP" | "SEMINAR" | "all";
export type EventStatusFilter = "pending" | "approved" | "rejected" | "all";
export type EventDateRange = "all" | "upcoming" | "past";

export interface EventFilterState {
  search: string;
  type: EventTypeFilter;
  status: EventStatusFilter;
  dateRange: EventDateRange;
}

const DEFAULT_FILTERS: EventFilterState = {
  search: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

interface UseEventsReturn {
  filters: EventFilterState;
  filteredEvents: AppEvent[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  handleFilterChange: <K extends keyof EventFilterState>(
    key: K,
    value: EventFilterState[K]
  ) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

const PAGE_SIZE = 10;

export function useEvents(): UseEventsReturn {
  const { events, isLoading } = useEventStore();
  const [filters, setFilters] = useState<EventFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = useCallback(
    <K extends keyof EventFilterState>(key: K, value: EventFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset to page 1 on filter change
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // Apply all filters client-side against the store's event list
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      if (
        filters.search &&
        !e.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !e.location.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.dateRange === "upcoming" && new Date(e.startTime) < now) return false;
      if (filters.dateRange === "past" && new Date(e.startTime) >= now) return false;
      return true;
    });
  }, [events, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return {
    filters,
    filteredEvents,
    isLoading,
    currentPage,
    totalPages,
    handleFilterChange,
    resetFilters,
    setPage,
  };
}
