import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  AlertCircle,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { api, getApiErrorMessage } from "../../../lib/api";
import type { PendingRegistration, ReviewRegistrationPayload } from "../../../types/register";

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

  if (!state.open || !state.registration) return null;

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

  const inputStyle = {
    background: "rgba(74,0,78,0.03)",
    border: "1px solid rgba(212,175,55,0.3)",
    color: "var(--plum)",
    outline: "none" as const,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(54,1,58,0.55)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md bg-white relative overflow-hidden"
        style={{
          borderRadius: "24px",
          border: "1px solid rgba(212,175,55,0.3)",
          boxShadow: "0 24px 64px rgba(74,0,78,0.25)",
        }}
      >
        <div className="h-1" style={{ background: "linear-gradient(90deg, var(--plum-dark), var(--magenta), var(--gold))" }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-luxury text-xl font-bold" style={{ color: "var(--plum)" }}>
                Reject Registration
              </h3>
              <p className="text-sm mt-1 text-gray-500">
                {state.registration.guest_name} — {state.registration.event?.title}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--plum)", opacity: 0.55 }}>
                Rejection Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                placeholder="Explain why this registration cannot be approved..."
                className="block w-full px-4 py-3 text-sm rounded-xl resize-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid var(--magenta)")}
                onBlur={(e) => (e.target.style.border = "1px solid rgba(212,175,55,0.3)")}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm text-red-600" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ color: "var(--plum)", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
              >
                {isSubmitting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: "var(--magenta)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-luxury text-4xl font-bold" style={{ color: "var(--plum)" }}>
            Registered Attendees
          </h1>
          <div className="h-0.5 w-16 mt-2 mb-1" style={{ background: "linear-gradient(90deg, var(--gold), var(--magenta))" }} />
          <p className="text-gray-500 text-sm mt-1">
            Review guest applications and view approved attendees.
          </p>
        </div>
        <button
          onClick={fetchRegistrations}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: "var(--plum)", border: "1px solid rgba(212,175,55,0.3)", background: "white" }}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="inline-flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.3)" }}>
        {(["pending", "approved"] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className="px-4 py-2 text-sm font-semibold capitalize transition-colors"
            style={{
              background: activeView === view ? "linear-gradient(135deg, var(--plum), var(--magenta))" : "white",
              color: activeView === view ? "white" : "var(--plum)",
            }}
          >
            {view === "pending" ? "Pending Review" : "Approved Attendees"}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl text-red-600" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {!error && registrations.length === 0 && !isLoading ? (
        <div
          className="text-center py-20 bg-white rounded-2xl"
          style={{ border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 2px 12px rgba(74,0,78,0.07)" }}
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-70" />
          <h3 className="font-luxury text-2xl font-semibold" style={{ color: "var(--plum)" }}>
            All caught up
          </h3>
          <p className="text-gray-500 mt-2">
            {activeView === "pending"
              ? "There are no pending registration applications to review."
              : "There are no approved attendees yet."}
          </p>
        </div>
      ) : (
        !error && (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 2px 12px rgba(74,0,78,0.07)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(74,0,78,0.03)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
                    <th className="text-left px-5 py-4 font-semibold" style={{ color: "var(--plum)" }}>Guest</th>
                    <th className="text-left px-5 py-4 font-semibold" style={{ color: "var(--plum)" }}>Contact</th>
                    <th className="text-left px-5 py-4 font-semibold" style={{ color: "var(--plum)" }}>Event</th>
                    <th className="text-left px-5 py-4 font-semibold" style={{ color: "var(--plum)" }}>Date</th>
                    <th className="text-left px-5 py-4 font-semibold" style={{ color: "var(--plum)" }}>Status</th>
                    {activeView === "pending" && (
                      <th className="text-right px-5 py-4 font-semibold" style={{ color: "var(--plum)" }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-medium" style={{ color: "var(--plum)" }}>
                          <User className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />
                          {reg.guest_name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                            {reg.guest_email}
                          </div>
                          {reg.guest_phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                              {reg.guest_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--plum)" }}>
                        {reg.event?.title ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                          {reg.event?.startTime
                            ? new Date(reg.event.startTime).toLocaleDateString()
                            : new Date(reg.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: "rgba(212,175,55,0.15)",
                            color: "var(--plum)",
                            border: "1px solid rgba(212,175,55,0.35)",
                          }}
                        >
                          {reg.status}
                        </span>
                      </td>
                      {activeView === "pending" && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(reg)}
                              disabled={actionId === reg.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ open: true, registration: reg })}
                              disabled={actionId === reg.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      <RejectModal
        state={rejectModal}
        onClose={() => setRejectModal({ open: false, registration: null })}
        onConfirm={handleReject}
      />
    </div>
  );
};
