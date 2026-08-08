export interface AppEvent {
  id: number;
  title: string;
  type: "SEMINAR" | "WORKSHOP" | "CONFERENCE";
  location: string;
  startTime: string; // ISO string
  endTime: string;
  capacity: number;
  description: string;
  imgUrl: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: number;
  ReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  title: string;
  type: string;
  location: string;
  start_time: string;
  end_time: string;
  capacity: number;
  description: string;
  img_url: string;
}
