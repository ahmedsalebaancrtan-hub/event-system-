import { create } from "zustand";
import { api } from "../lib/api";
import type { AppEvent } from "../types/event";

interface EventState {
  events: AppEvent[];
  approvedEvents: AppEvent[];
  selectedEvent: AppEvent | null;
  isLoading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  fetchEventDetails: (eventId: string | number) => Promise<void>;
  updateEvent: (id: string | number, data: Partial<AppEvent>) => Promise<void>;
  approveEvent: (id: string | number) => Promise<void>;
  rejectEvent: (id: string | number) => Promise<void>;
  fetchApprovedEvents: () => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  approvedEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/events/list");
      set({ events: response.data.data || response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch events", isLoading: false });
    }
  },

  fetchEventDetails: async (eventId: string | number) => {
    set({ isLoading: true, error: null, selectedEvent: null });
    try {
      const response = await api.get(`/events/details/${eventId}`);
      // The backend returns { "data": event }
      set({ selectedEvent: response.data.data || response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch event details", isLoading: false });
    }
  },

  updateEvent: async (id: string | number, data: Partial<AppEvent>) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/events/Update/${id}`, data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to update event", isLoading: false });
      throw err;
    }
  },

  approveEvent: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/events/approve/${id}`, { status: "approved" });
      
      const { selectedEvent, events } = get();
      if (selectedEvent && selectedEvent.id.toString() === id.toString()) {
        set({ selectedEvent: { ...selectedEvent, status: "approved" } });
      }
      set({
        events: events.map(e => e.id.toString() === id.toString() ? { ...e, status: "approved" } : e),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to approve event", isLoading: false });
      throw err;
    }
  },

  rejectEvent: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/events/approve/${id}`, { status: "rejected" });
      
      const { selectedEvent, events } = get();
      if (selectedEvent && selectedEvent.id.toString() === id.toString()) {
        set({ selectedEvent: { ...selectedEvent, status: "rejected" } });
      }
      set({
        events: events.map(e => e.id.toString() === id.toString() ? { ...e, status: "rejected" } : e),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to reject event", isLoading: false });
      throw err;
    }
  },

  fetchApprovedEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/events/approved-event");
      set({ approvedEvents: response.data.data || response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to fetch approved events", isLoading: false });
    }
  },

  searchEvents: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/events/search?q=${encodeURIComponent(query)}`);
      set({ events: response.data.data || response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to search events", isLoading: false });
    }
  }
}));
