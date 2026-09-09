package dtos

// ReportQueryDTO holds all query parameters for the reports endpoint.
type ReportQueryDTO struct {
	// Type controls what data is returned and how it's sorted.
	// Accepted values: "performance" | "trends" | "details"
	Type string `form:"type"`

	// SortBy is used for the performance report (e.g. "most_registered", "highest_fill_rate", etc.)
	SortBy string `form:"sort_by"`

	// EventID is used to filter details report to a single event.
	EventID uint `form:"event_id"`

	// Year filters events by calendar year (e.g. 2026). 0 = no filter.
	Year int `form:"year"`

	// Month filters events by calendar month (1–12). 0 = all months.
	Month int `form:"month"`

	// StartDate / EndDate accept YYYY-MM-DD for custom date range filtering.
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`

	// Category maps to Event.Type: WORKSHOP | SEMINAR | CONFERENCE.
	Category string `form:"category"`
}

// ReportRow is the per-event data shape returned to the client (Event Performance).
type ReportRow struct {
	ID                uint    `json:"id"`
	Title             string  `json:"title"`
	Type              string  `json:"type"`
	Location          string  `json:"location"`
	Capacity          int     `json:"capacity"`
	RegistrationCount int64   `json:"registration_count"`
	AvailableSeats    int     `json:"available_seats"`
	FillRate          float64 `json:"fill_rate"`
	StartTime         string  `json:"start_time"`
	EndTime           string  `json:"end_time"`
	Status            string  `json:"status"`
}

// TrendReportRow is the aggregated month-by-month data for Registration Trends.
type TrendReportRow struct {
	Period            string `json:"period"`
	EventCount        int    `json:"event_count"`
	RegistrationCount int    `json:"registration_count"`
}

// AttendeeReportRow is the per-attendee data shape for the attendee roster report (Event Registration Details).
type AttendeeReportRow struct {
	RegistrationID uint   `json:"registration_id"`
	GuestName      string `json:"guest_name"`
	GuestEmail     string `json:"guest_email"`
	GuestPhone     string `json:"guest_phone"`
	RegStatus      string `json:"reg_status"`
	EventID        uint   `json:"event_id"`
	EventTitle     string `json:"event_title"`
	EventType      string `json:"event_type"`
	EventLocation  string `json:"event_location"`
	EventStartTime string `json:"event_start_time"`
	EventStatus    string `json:"event_status"`
}

// ReportFilterContext is echoed back so the frontend can build dynamic subtitles and show summary stats.
type ReportFilterContext struct {
	Type      string `json:"type"`
	SortBy    string `json:"sort_by"`
	EventID   uint   `json:"event_id"`
	Year      int    `json:"year"`
	Month     int    `json:"month"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Category  string `json:"category"`
	Total     int    `json:"total"` // Number of rows returned

	// Contextual summary statistics based on the report type
	TotalEvents         int     `json:"total_events,omitempty"`
	TotalRegistrations  int     `json:"total_registrations,omitempty"`
	AverageFillRate     float64 `json:"average_fill_rate,omitempty"`
	EventsNearCapacity  int     `json:"events_near_capacity,omitempty"`
	AvgRegPerEvent      float64 `json:"avg_reg_per_event,omitempty"`
	MostPopularEvent    string  `json:"most_popular_event,omitempty"`
	MostPopularCategory string  `json:"most_popular_category,omitempty"`
	EventCapacity       int     `json:"event_capacity,omitempty"`
	AvailableSeats      int     `json:"available_seats,omitempty"`
}
