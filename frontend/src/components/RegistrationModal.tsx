import { useEffect, useState } from "react";
import { X, Mail, User, Phone, Calendar, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { publicApi } from "../lib/api";
import type { AppEvent } from "../types/event";
import type { PublicRegisterPayload } from "../types/register";

interface RegistrationModalProps {
  event: AppEvent | null;
  onClose: () => void;
}

export const RegistrationModal = ({ event, onClose }: RegistrationModalProps) => {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (event) {
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setError("");
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [event]);

  if (!event) return null;

  const inputStyle = {
    background: "rgba(74,0,78,0.03)",
    border: "1px solid rgba(212,175,55,0.3)",
    color: "var(--plum)",
    outline: "none" as const,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const payload: PublicRegisterPayload = {
      event_id: event.id,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim() || undefined,
    };

    try {
      await publicApi.post("/public/register", payload);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to submit registration. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(54,1,58,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white relative overflow-hidden"
        style={{
          borderRadius: "24px",
          border: "1px solid rgba(212,175,55,0.3)",
          boxShadow: "0 24px 64px rgba(74,0,78,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1" style={{ background: "linear-gradient(90deg, var(--plum-dark), var(--magenta), var(--gold))" }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-luxury text-xl font-bold" style={{ color: "var(--plum)" }}>
                Register for Event
              </h3>
              <p className="text-sm mt-1 text-gray-500">{event.title}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div
            className="mb-5 p-4 rounded-xl space-y-2"
            style={{ background: "rgba(74,0,78,0.03)", border: "1px solid rgba(212,175,55,0.2)" }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />
              {new Date(event.startTime).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />
              {event.location}
            </div>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold" style={{ color: "var(--plum)" }}>
                Application Submitted!
              </p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Your registration is pending approval. You will receive an email once your application has been reviewed.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl text-white font-medium"
                style={{ background: "linear-gradient(135deg, var(--plum), var(--magenta))" }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--plum)", opacity: 0.55 }}>
                  Full Name <span style={{ color: "var(--magenta)" }}>*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gold)" }} />
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="block w-full pl-10 pr-4 py-3 text-sm rounded-xl"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.border = "1px solid var(--magenta)")}
                    onBlur={(e) => (e.target.style.border = "1px solid rgba(212,175,55,0.3)")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--plum)", opacity: 0.55 }}>
                  Email Address <span style={{ color: "var(--magenta)" }}>*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gold)" }} />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-4 py-3 text-sm rounded-xl"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.border = "1px solid var(--magenta)")}
                    onBlur={(e) => (e.target.style.border = "1px solid rgba(212,175,55,0.3)")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--plum)", opacity: 0.55 }}>
                  Phone Number <span className="normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gold)" }} />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full pl-10 pr-4 py-3 text-sm rounded-xl"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.border = "1px solid var(--magenta)")}
                    onBlur={(e) => (e.target.style.border = "1px solid rgba(212,175,55,0.3)")}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "var(--plum)", border: "1px solid rgba(212,175,55,0.3)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, var(--plum), var(--magenta))" }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
