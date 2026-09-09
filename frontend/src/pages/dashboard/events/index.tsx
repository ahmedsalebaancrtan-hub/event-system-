import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Calendar as CalendarIcon, AlertCircle,
  Search, X, Filter, SlidersHorizontal, MoreHorizontal,
  Eye, Pencil, CheckCircle, XCircle, Trash2,
} from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useEventStore } from "../../../store/event-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "../../../components/common/DataTablePagination";
import type { AppEvent } from "../../../types/event";

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

// ─── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: AppEvent["status"] }) => {
  if (status === "approved")
    return (
      <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1 uppercase tracking-wide text-[10px] font-bold">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
        Approved
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1 uppercase tracking-wide text-[10px] font-bold">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
        Pending
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 gap-1 uppercase tracking-wide text-[10px] font-bold">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
      Rejected
    </Badge>
  );
};

// ─── Type Badge ────────────────────────────────────────────────
const TypeBadge = ({ type }: { type: AppEvent["type"] }) => (
  <Badge
    variant="secondary"
    className="uppercase tracking-wide text-[10px] font-bold text-muted-foreground bg-muted border border-border/50"
  >
    {type}
  </Badge>
);

// ─── Thumbnail Cell ────────────────────────────────────────────
const ThumbnailCell = ({ imgUrl, title }: { imgUrl: string; title: string }) => (
  <div className="flex-shrink-0 h-10 w-14 rounded-md overflow-hidden border border-border/50 bg-muted">
    {imgUrl ? (
      <img src={imgUrl} alt={title} className="h-full w-full object-cover" />
    ) : (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600">
        <CalendarIcon className="h-4 w-4 text-primary/60" />
      </div>
    )}
  </div>
);

// ─── Row Actions Dropdown ─────────────────────────────────────
const RowActions = ({
  event,
  isAdmin,
  isOrganizer,
  onApprove,
  onReject,
}: {
  event: AppEvent;
  isAdmin: boolean;
  isOrganizer: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={`event-actions-${event.id}`}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* View Details */}
        <DropdownMenuItem
          id={`view-event-${event.id}`}
          className="gap-2 cursor-pointer"
          onClick={() => navigate(`/dashboard/directories/${event.id}`)}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </DropdownMenuItem>

        {/* Edit — Admin or Organizer only */}
        {(isAdmin || isOrganizer) && (
          <DropdownMenuItem
            id={`edit-event-${event.id}`}
            className="gap-2 cursor-pointer"
            onClick={() => navigate(`/dashboard/directories/${event.id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
        )}

        {/* Approve / Reject — Admin only */}
        {isAdmin && event.status !== "approved" && (
          <DropdownMenuItem
            id={`approve-event-${event.id}`}
            className="gap-2 cursor-pointer text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
            onClick={() => onApprove(event.id)}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </DropdownMenuItem>
        )}
        {isAdmin && event.status !== "rejected" && (
          <DropdownMenuItem
            id={`reject-event-${event.id}`}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => onReject(event.id)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </DropdownMenuItem>
        )}

        {/* Delete — Admin only */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id={`delete-event-${event.id}`}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── Main Component ────────────────────────────────────────────
export const EventList = () => {
  const { user } = useUserStore();
  const { events, isLoading, error, fetchEvents, filterEvents, approveEvent, rejectEvent, pagination } = useEventStore();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = user?.role === "ADMIN";
  const isOrganizer = user?.role === "ORGANIZER";
  const canCreate = isAdmin || isOrganizer;

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
    setPage(1);

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
    setPage(1);
    if (hasActiveFilters) {
      applyBackendFilters(filters, 1, newLimit);
    }
  };

  const handleApprove = async (id: number) => {
    try { await approveEvent(id); } catch { /* handled in store */ }
  };

  const handleReject = async (id: number) => {
    try { await rejectEvent(id); } catch { /* handled in store */ }
  };

  // Client-side date range filter (applied after backend results)
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
      {/* ── Header ─────────────────────────────────────────────── */}
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

      {/* ── Filter Bar ─────────────────────────────────────────── */}
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

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ── Results count ─────────────────────────────────────── */}
      {!isLoading && displayedEvents.length > 0 && hasActiveFilters && (
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {displayedEvents.length} result{displayedEvents.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* ── Empty State ───────────────────────────────────────── */}
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
        /* ── Data Table ──────────────────────────────────────── */
        <Card className="bg-card border-border overflow-hidden">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                  <TableHead className="w-[64px] pl-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Thumb
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Event Title
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell">
                    Capacity
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right pr-4 w-[60px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    id={`event-row-${event.id}`}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <TableCell className="pl-4 py-3">
                      <ThumbnailCell imgUrl={event.imgUrl} title={event.title} />
                    </TableCell>

                    {/* Event Title */}
                    <TableCell className="py-3 max-w-[200px]">
                      <Link
                        to={`/dashboard/directories/${event.id}`}
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 group-hover:underline underline-offset-2"
                      >
                        {event.title}
                      </Link>
                      {/* Show location on small screens inline */}
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 md:hidden">
                        {event.location}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-3 max-w-[160px] hidden md:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">{event.location}</span>
                    </TableCell>

                    {/* Capacity */}
                    <TableCell className="py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {event.capacity.toLocaleString()} Attendees
                      </span>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-3 hidden sm:table-cell">
                      <TypeBadge type={event.type} />
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <StatusBadge status={event.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 pr-4 text-right">
                      <RowActions
                        event={event}
                        isAdmin={isAdmin}
                        isOrganizer={isOrganizer}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── Pagination ────────────────────────────────────────── */}
      {!isLoading && displayedEvents.length > 0 && pagination && (
        <DataTablePagination
          meta={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          defaultLimit={10}
        />
      )}
    </div>
  );
};
