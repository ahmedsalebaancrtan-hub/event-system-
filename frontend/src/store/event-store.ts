import { create } from "zustand";
import { api } from "../lib/api";
import type { AppEvent, PaginationMeta } from "../types/event";

interface EventFilterParams {
  search?: string;
  type?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  limit?: number;
}

interface EventState {
  events: AppEvent[];
  approvedEvents: AppEvent[];
  selectedEvent: AppEvent | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  fetchEvents: (page?: number, limit?: number) => Promise<void>;
  filterEvents: (params: EventFilterParams) => Promise<void>;
  fetchEventDetails: (eventId: string | number) => Promise<void>;
  updateEvent: (id: string | number, data: Partial<AppEvent>) => Promise<void>;
  approveEvent: (id: string | number) => Promise<void>;
  rejectEvent: (id: string | number) => Promise<void>;
  fetchApprovedEvents: () => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  approvedEvents: [],
  selectedEvent: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchEvents: async (page = 1, limit = 8) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/events/list?page=${page}&limit=${limit}`);
      set({ 
        events: response.data.data || response.data, 
        pagination: response.data.pagination || null,
        isLoading: false 
      });
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

  filterEvents: async (params: EventFilterParams) => {
    set({ isLoading: true, error: null });
    try {
      const urlParams = new URLSearchParams();
      if (params.search) urlParams.append("search", params.search);
      if (params.type) urlParams.append("type", params.type);
      if (params.status) urlParams.append("status", params.status);
      if (params.start_time) urlParams.append("start_time", params.start_time);
      if (params.end_time) urlParams.append("end_time", params.end_time);
      if (params.page) urlParams.append("page", params.page.toString());
      if (params.limit) urlParams.append("limit", params.limit.toString());
      
      const response = await api.get(`/events/search?${urlParams.toString()}`);
      set({ 
        events: response.data.data || response.data, 
        pagination: response.data.pagination || null,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || "Failed to filter events", isLoading: false });
    }
  },
}));
