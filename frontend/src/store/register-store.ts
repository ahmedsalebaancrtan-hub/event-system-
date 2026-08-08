import { create } from "zustand";
import { api } from "../lib/api";
import type { Attendee, RegisteredEvent, RegisterPayload } from "../types/register";

interface RegisterState {
  attendees: Attendee[];
  myRegisteredEvents: RegisteredEvent[];
  isLoading: boolean;
  error: string | null;

  registerToEvent: (eventId: number) => Promise<void>;
  fetchEventAttendees: (eventId: number) => Promise<void>;
  fetchMyRegisteredEvents: (userId: number) => Promise<void>;
  cancelRegistration: (eventId: number) => Promise<void>;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  attendees: [],
  myRegisteredEvents: [],
  isLoading: false,
  error: null,

  registerToEvent: async (eventId: number) => {
    set({ isLoading: true, error: null });
    try {
      const payload: RegisterPayload = { event_id: eventId };
      await api.post("/registers/create", payload);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to register for event", isLoading: false });
      throw err;
    }
  },

  fetchEventAttendees: async (eventId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/registers/events/${eventId}/users`);
      // Backend wraps array in a "data" object: { data: [...] }
      set({ attendees: response.data.data || response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch attendees", isLoading: false });
    }
  },

  fetchMyRegisteredEvents: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/registers/users/${userId}/events`);
      set({ myRegisteredEvents: response.data.data || response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch registered events", isLoading: false });
    }
  },

  cancelRegistration: async (eventId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/registers/${eventId}`);
      
      // Purge the item from the local array smoothly
      const { myRegisteredEvents } = get();
      set({
        myRegisteredEvents: myRegisteredEvents.filter(event => event.id !== eventId),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to cancel registration", isLoading: false });
      throw err;
    }
  }
}));
