import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, MapPin, Calendar as CalendarIcon, Users, AlertCircle,
  Search, X, Filter, SlidersHorizontal,
} from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useEventStore } from "../../../store/event-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTablePagination } from "../../../components/pagination/DataTablePagination";

// ─── Helpers ──────────────────────────────────────────────────
const EVENT_TYPES = ["CONFERENCE", "WORKSHOP", "SEMINAR"] as const;
const EVENT_STATUSES = ["pending", "approved", "rejected"] as const;

type EventType = typeof EVENT_TYPES[number] | "all";
type EventStatus = typeof EVENT_STATUSES[number] | "all";

interface FilterState {
  search: string;
  type: EventType;
  status: EventStatus;
  dateRange: "all" | "upcoming" | "past";
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

export const EventList = () => {
  const { user } = useUserStore();
  const { events, isLoading, error, fetchEvents, filterEvents, pagination } = useEventStore();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canCreate = user?.role === "ADMIN" || user?.role === "ORGANIZER";

  // ─── Filter Computation ──────────────────────────────────────
  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.dateRange !== "all";

  // Fetch events on mount or when page/limit changes without filters
  useEffect(() => {
    if (!hasActiveFilters) {
      fetchEvents(page, limit);
    }
  }, [fetchEvents, page, limit]);

  // Trigger backend filter when type/status/page changes; debounce search
  const applyBackendFilters = (f: FilterState, p: number, l: number) => {
    const params: Record<string, any> = { page: p, limit: l };
    if (f.search) params.search = f.search;
    if (f.type !== "all") params.type = f.type;
    if (f.status !== "all") params.status = f.status;
    filterEvents(params);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value } as FilterState;
    setFilters(newFilters);
    setPage(1); // Reset page on filter change

    if (key === "search") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applyBackendFilters(newFilters, 1, limit), 350);
    } else {
      applyBackendFilters(newFilters, 1, limit);
    }
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    fetchEvents(1, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (hasActiveFilters) {
      applyBackendFilters(filters, newPage, limit);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset page when limit changes
    if (hasActiveFilters) {
      applyBackendFilters(filters, 1, newLimit);
    }
  };

  // ─── Client-side date range filter (applied after backend results) ─
  const displayedEvents = events.filter((event) => {
    if (filters.dateRange === "all") return true;
    const now = new Date();
    const start = new Date(event.startTime);
    if (filters.dateRange === "upcoming") return start >= now;
    if (filters.dateRange === "past") return start < now;
    return true;
  });

  // ─── Loading ──────────────────────────────────────────────────
  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Directories</h1>
          <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground text-sm mt-1">Browse and manage all registered events in the system.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="toggle-filters-btn"
            variant="outline"
            onClick={() => setFiltersVisible((v) => !v)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
          {canCreate && (
            <Button id="create-event-btn" asChild className="gap-2 rounded-xl">
              <Link to="/dashboard/directories/create">
                <Plus className="w-5 h-5" />
                Create Event
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {filtersVisible && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filter Events
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="event-search"
                    type="text"
                    placeholder="Search by title or location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleFilterChange("search", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Type filter */}
                <Select value={filters.type} onValueChange={(v) => handleFilterChange("type", v)}>
                  <SelectTrigger id="event-type-filter" className="w-full sm:w-44">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                  <SelectTrigger id="event-status-filter" className="w-full sm:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {EVENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range filter */}
                <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange("dateRange", v)}>
                  <SelectTrigger id="event-date-filter" className="w-full sm:w-44">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground whitespace-nowrap">
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results count */}
      {!isLoading && displayedEvents.length > 0 && hasActiveFilters && (
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {displayedEvents.length} result{displayedEvents.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Empty state */}
      {displayedEvents.length === 0 && !error && !isLoading ? (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/8 bg-muted/60">
              <CalendarIcon className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">
              {hasActiveFilters ? "No events match your filters" : "No events found"}
            </h3>
            <p className="text-muted-foreground mt-2">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters."
                : "There are currently no events registered in the system."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => (
            <Link
              key={event.id}
              to={`/dashboard/directories/${event.id}`}
              className="group bg-card overflow-hidden rounded-2xl border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative"
            >
              {/* Image / Fallback Header */}
              <div className="relative h-56 w-full overflow-hidden shrink-0">
                {event.imgUrl ? (
                  <>
                    <img
                      src={event.imgUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700">
                    <div className="absolute w-40 h-40 rounded-full border border-white/10 -top-10 -right-10" />
                    <div className="absolute w-60 h-60 rounded-full border border-white/5 -bottom-20 -left-20" />
                    <CalendarIcon className="w-14 h-14 relative z-10 drop-shadow-lg text-primary/70" />
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge
                    variant={
                      event.status === "approved" ? "success" :
                      event.status === "rejected" ? "destructive" : "warning"
                    }
                    className="text-[10px] uppercase tracking-wide backdrop-blur-sm"
                  >
                    {event.status}
                  </Badge>
                </div>

                {/* Type badge */}
                <div className="absolute top-4 left-4 z-20">
                  <Badge variant="secondary" className="backdrop-blur-md bg-black/60 text-yellow-300 border-0 text-[10px] font-bold">
                    {event.type}
                  </Badge>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 z-20 bg-gradient-to-r from-primary to-primary/50" />
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4 line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <CalendarIcon className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                    {new Date(event.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <MapPin className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <Users className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                    {event.capacity} Attendees
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination component */}
      {!isLoading && displayedEvents.length > 0 && pagination && (
        <DataTablePagination 
          meta={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          defaultLimit={8}
        />
      )}
    </div>
  );
};
