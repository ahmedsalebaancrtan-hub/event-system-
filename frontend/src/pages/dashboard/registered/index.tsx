import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { api, getApiErrorMessage } from "../../../lib/api";
import type { PendingRegistration, ReviewRegistrationPayload } from "../../../types/register";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RejectModalState {
  open: boolean;
  registration: PendingRegistration | null;
}

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

export const RegisteredEvents = () => {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [activeView, setActiveView] = useState<"pending" | "approved">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState>({ open: false, registration: null });

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get(`/registrations/${activeView}`);
      setRegistrations(response.data.data ?? []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setError("You do not have permission to view registrations.");
      } else {
        setError(getApiErrorMessage(err, `Failed to load ${activeView} registrations.`));
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeView]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const reviewRegistration = async (id: number, payload: ReviewRegistrationPayload) => {
    setActionId(id);
    try {
      await api.patch(`/registrations/${id}/review`, payload);
      await fetchRegistrations();
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

  if (isLoading && registrations.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Registered Attendees</h1>
          <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground text-sm mt-1">
            Review guest applications and view approved attendees.
          </p>
        </div>
        <Button
          id="registrations-refresh-btn"
          variant="outline"
          onClick={fetchRegistrations}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* View tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "pending" | "approved")}>
        <TabsList>
          <TabsTrigger id="tab-pending" value="pending">Pending Review</TabsTrigger>
          <TabsTrigger id="tab-approved" value="approved">Approved Attendees</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && registrations.length === 0 && !isLoading && (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500/60" />
            <h3 className="text-2xl font-semibold text-foreground">All caught up</h3>
            <p className="text-muted-foreground mt-2">
              {activeView === "pending"
                ? "There are no pending registration applications to review."
                : "There are no approved attendees yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!error && registrations.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {activeView === "pending" && <TableHead className="text-right">Actions</TableHead>}
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
                    {activeView === "pending" && (
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
