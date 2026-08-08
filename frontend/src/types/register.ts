import type { User } from "./user";
import type { AppEvent } from "./event";

export interface RegisterPayload {
  event_id: number;
}

// The backend returns an array of models.User
export interface Attendee extends User {}

// The backend returns an array of models.Event
export interface RegisteredEvent extends AppEvent {}
