import { useEffect, useState } from "react";
import { Mail, User, Phone, Calendar, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { publicApi } from "../lib/api";
import type { AppEvent } from "../types/event";
import type { PublicRegisterPayload } from "../types/register";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (event) {
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setError("");
      setSuccess(false);
      setSuccessMessage("");
      setIsSubmitting(false);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const payload: PublicRegisterPayload = {
      event_id: event!.id,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim() || undefined,
    };

    try {
      const response = await publicApi.post("/public/register", payload);
      const registrationStatus = response.data?.status;
      setSuccessMessage(
        registrationStatus === "approved"
          ? "Hambalyo! Diwaangelintaadii waa la aqbalay. Email muhiim ah ayaa loo diray inbox-kaaga."
          : "Codsigaaga waa la helay oo waa Pending. Waxaa lagu soo xidhiidhi doonaa email marka la eego."
      );
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
    <Dialog open={!!event} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>{event?.title}</DialogDescription>
        </DialogHeader>

        {/* Event Info */}
        {event && (
          <div className="rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0 text-primary/70" />
              {new Date(event.startTime).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
              {event.location}
            </div>
          </div>
        )}

        {/* Success state */}
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/10">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-semibold text-foreground">
              {successMessage.startsWith("Hambalyo") ? "Registration Approved!" : "Application Submitted!"}
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {successMessage}
            </p>
            <Button id="registration-close-btn" className="mt-6" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-guest-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reg-guest-name"
                  value={guestName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-guest-email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reg-guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-guest-phone">
                Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reg-guest-phone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                id="registration-cancel-btn"
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                id="registration-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
