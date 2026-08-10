import type { User } from "./user";
import type { AppEvent } from "./event";

export interface RegisterPayload {
  event_id: number;
}

export interface Attendee extends User {}

export interface RegisteredEvent extends AppEvent {}

export interface PublicRegisterPayload {
  event_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export interface PendingRegistration {
  id: number;
  event_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  event: AppEvent;
}

export interface ReviewRegistrationPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
}
