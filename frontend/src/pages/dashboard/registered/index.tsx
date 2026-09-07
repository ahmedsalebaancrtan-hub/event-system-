import { useCallback, useEffect, useState, useRef } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  User,
  Search,
  X,
  Download,
  Filter,
} from "lucide-react";
import { api, getApiErrorMessage } from "../../../lib/api";
import type { PendingRegistration, ReviewRegistrationPayload } from "../../../types/register";
import { downloadCSV, downloadPDF, isoDate, capitalize, titleCase } from "../../../lib/export-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEventStore } from "../../../store/event-store";
import type { PaginationMeta } from "../../../types/event";
import { DataTablePagination } from "../../../components/pagination/DataTablePagination";

// ─── Types ────────────────────────────────────────────────────
interface RejectModalState {
  open: boolean;
  registration: PendingRegistration | null;
}

// ─── Helpers ──────────────────────────────────────────────────
function exportRegistrationsCSV(registrations: PendingRegistration[], statusLabel: string) {
  const headers = ["Guest Name", "Email", "Phone", "Event", "Status", "Date"];
  const rows = registrations.map((r) => [
    r.guest_name,
    r.guest_email,
    r.guest_phone || "",
    r.event?.title || "",
    capitalize(r.status),
    r.event?.startTime
      ? new Date(r.event.startTime).toLocaleDateString("en-GB")
      : new Date(r.created_at).toLocaleDateString("en-GB"),
  ]);
  const label = statusLabel === "all" ? "All" : capitalize(statusLabel);
  downloadCSV(headers, rows, `Attendee_Roster_${label}_${isoDate()}.csv`);
}

async function exportRegistrationsPDF(
  registrations: PendingRegistration[],
  statusLabel: string,
  generatedBy?: string
) {
  const label = statusLabel === "all" ? "All" : capitalize(statusLabel);
  await downloadPDF({
    title: "Registration Report",
    subtitle: `Status: ${label} · ${new Date().toLocaleDateString("en-GB")}`,
    generatedBy,
    summaryItems: [
      { label: "Total Registrations", value: registrations.length },
      { label: "Approved",            value: registrations.filter(r => r.status === "approved").length },
      { label: "Pending",             value: registrations.filter(r => r.status === "pending").length },
      { label: "Rejected",            value: registrations.filter(r => r.status === "rejected").length },
    ],
    columns: [
      { header: "Guest Name", dataKey: "guest_name" },
      { header: "Email",      dataKey: "guest_email" },
      { header: "Phone",      dataKey: "guest_phone" },
      { header: "Event",      dataKey: "event_title" },
      { header: "Status",     dataKey: "status" },
      { header: "Date",       dataKey: "date" },
    ],
    rows: registrations.map((r) => ({
      guest_name:  r.guest_name,
      guest_email: r.guest_email,
      guest_phone: r.guest_phone || "—",
      event_title: r.event?.title || "—",
      status:      capitalize(r.status),
      date:        r.event?.startTime
        ? new Date(r.event.startTime).toLocaleDateString("en-GB")
        : new Date(r.created_at).toLocaleDateString("en-GB"),
    })),
    filename: `Registration_Report_${label}_${isoDate()}.pdf`,
  });
}

// ─── Reject Modal ─────────────────────────────────────────────
const RejectModal = ({
  state,
  onClose,
  onConfirm,
}: {
  state: RejectModalState;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state.open) {
      setReason("");
      setError("");
      setIsSubmitting(false);
    }
  }, [state.open, state.registration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to reject registration.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Registration</DialogTitle>
          <DialogDescription>
            {state.registration?.guest_name} — {state.registration?.event?.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Rejection Reason</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="Explain why this registration cannot be approved..."
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm bg-destructive/10 border border-destructive/30 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button id="reject-cancel-btn" type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="reject-confirm-btn"
              type="submit"
              disabled={isSubmitting}
              variant="destructive"
              className="flex-1"
            >
              {isSubmitting ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────
export const RegisteredEvents = () => {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState>({ open: false, registration: null });

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const { events, fetchEvents } = useEventStore();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch events for the event filter dropdown on mount
  useEffect(() => {
    if (events.length === 0) fetchEvents();
  }, []);

  const fetchRegistrations = useCallback(async (status: string, eventId: string, search: string, p: number, l: number) => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.append("status", status);
      if (eventId && eventId !== "all") params.append("event_id", eventId);
      if (search) params.append("search", search);
      params.append("page", p.toString());
      params.append("limit", l.toString());

      const response = await api.get(`/registrations/search?${params.toString()}`);
      setRegistrations(response.data.data ?? []);
      setPagination(response.data.pagination ?? null);
    } catch (err: unknown) {
      const statusCode = (err as { response?: { status?: number } })?.response?.status;
      if (statusCode === 403) {
        setError("You do not have permission to view registrations.");
      } else {
        setError(getApiErrorMessage(err, "Failed to load registrations."));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger fetch on filter changes with debounce for search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchRegistrations(statusFilter, eventFilter, searchQuery, page, limit);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [statusFilter, eventFilter, searchQuery, page, limit, fetchRegistrations]);

  const reviewRegistration = async (id: number, payload: ReviewRegistrationPayload) => {
    setActionId(id);
    try {
      await api.patch(`/registrations/${id}/review`, payload);
      fetchRegistrations(statusFilter, eventFilter, searchQuery, page, limit);
    } finally {
      setActionId(null);
    }
  };

  const handleApprove = async (registration: PendingRegistration) => {
    try {
      await reviewRegistration(registration.id, { status: "approved" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectModal.registration) return;
    await reviewRegistration(rejectModal.registration.id, {
      status: "rejected",
      rejection_reason: reason,
    });
  };

  const clearFilters = () => {
    setStatusFilter("pending");
    setEventFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleEventFilterChange = (val: string) => {
    setEventFilter(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const hasActiveFilters = searchQuery || eventFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registered Attendees</h1>
          <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage guest registrations across all events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {registrations.length > 0 && (
            <Button
              id="export-registrations-btn"
              variant="outline"
              onClick={() => exportRegistrationsCSV(registrations, statusFilter)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
          <Button
            id="registrations-refresh-btn"
            variant="outline"
            onClick={() => fetchRegistrations(statusFilter, eventFilter, searchQuery, page, limit)}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filter Registrations
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="registration-search"
                  type="text"
                  placeholder="Search by guest name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger id="registration-status-filter" className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Event filter */}
              <Select value={eventFilter} onValueChange={handleEventFilterChange}>
                <SelectTrigger id="registration-event-filter" className="w-full sm:w-56">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((evt) => (
                    <SelectItem key={evt.id} value={String(evt.id)}>
                      {evt.title}
                    </SelectItem>
                  ))}
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && registrations.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
        </div>
      )}

      {/* Empty state */}
      {!error && registrations.length === 0 && !isLoading && (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500/60" />
            <h3 className="text-2xl font-semibold text-foreground">No registrations found</h3>
            <p className="text-muted-foreground mt-2">
              {hasActiveFilters || statusFilter !== "pending"
                ? "No registrations match your current filters."
                : "There are no pending registration applications to review."}
            </p>
            {(hasActiveFilters || statusFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!error && registrations.length > 0 && (
        <Card>
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {registrations.length} result{registrations.length !== 1 ? "s" : ""}
              {statusFilter !== "all" && ` · ${statusFilter}`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {statusFilter === "pending" && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <User className="w-4 h-4 shrink-0 text-primary/60" />
                        {reg.guest_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                          {reg.guest_email}
                        </div>
                        {reg.guest_phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                            {reg.guest_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {reg.event?.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                        <span className="text-xs">
                          {reg.event?.startTime
                            ? new Date(reg.event.startTime).toLocaleDateString()
                            : new Date(reg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reg.status === "approved" ? "success" :
                          reg.status === "pending" ? "warning" :
                          "destructive"
                        }
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {reg.status}
                      </Badge>
                    </TableCell>
                    {statusFilter === "pending" && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            id={`approve-reg-${reg.id}`}
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(reg)}
                            disabled={actionId === reg.id}
                            className="gap-1.5 text-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button
                            id={`reject-reg-${reg.id}`}
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectModal({ open: true, registration: reg })}
                            disabled={actionId === reg.id}
                            className="gap-1.5 text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pagination && (
            <DataTablePagination
              meta={pagination}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              defaultLimit={10}
            />
          )}
        </Card>
      )}

      <RejectModal
        state={rejectModal}
        onClose={() => setRejectModal({ open: false, registration: null })}
        onConfirm={handleReject}
      />
    </div>
  );
};
