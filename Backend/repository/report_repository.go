package repository

import (
	"time"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/gorm"
)

// ReportRepo handles all reporting queries against the database.
type ReportRepo struct {
	DB *gorm.DB
}

func NewReportRepo(db *gorm.DB) *ReportRepo {
	return &ReportRepo{DB: db}
}

// GetEventReportData returns event-level report rows with registration counts.
// It applies month/year, custom date-range, category, and popularity ordering.
func (r *ReportRepo) GetEventReportData(q dtos.ReportQueryDTO) ([]dtos.ReportRow, error) {
	type rawRow struct {
		models.Event
		RegistrationCount int64 `gorm:"column:registration_count"`
	}

	subquery := r.DB.
		Model(&models.EventRegistration{}).
		Select("event_id, COUNT(*) AS registration_count").
		Where("status = ?", "approved").
		Group("event_id")

	query := r.DB.
		Model(&models.Event{}).
		Select("events.*, COALESCE(reg.registration_count, 0) AS registration_count").
		Joins("LEFT JOIN (?) AS reg ON reg.event_id = events.id", subquery)

	// ── Category / type filter ───────────────────────────────────────
	if q.Category != "" {
		query = query.Where("UPPER(events.type) = UPPER(?)", q.Category)
	}

	// ── Month + Year filter ──────────────────────────────────────────
	if q.Year > 0 && q.Month > 0 {
		query = query.
			Where("EXTRACT(MONTH FROM events.start_time) = ?", q.Month).
			Where("EXTRACT(YEAR  FROM events.start_time) = ?", q.Year)
	} else if q.Year > 0 {
		query = query.Where("EXTRACT(YEAR FROM events.start_time) = ?", q.Year)
	} else if q.Month > 0 {
		query = query.Where("EXTRACT(MONTH FROM events.start_time) = ?", q.Month)
	}

	// ── Custom date-range filter ─────────────────────────────────────
	const dateFmt = "2006-01-02"
	if q.StartDate != "" {
		start, err := time.Parse(dateFmt, q.StartDate)
		if err == nil {
			query = query.Where("events.start_time >= ?", start)
		}
	}
	if q.EndDate != "" {
		end, err := time.Parse(dateFmt, q.EndDate)
		if err == nil {
			endOfDay := end.Add(24*time.Hour - time.Nanosecond)
			query = query.Where("events.start_time <= ?", endOfDay)
		}
	}

	// ── Sort order ───────────────────────────────────────────────────
	switch q.SortBy {
	case "highest_fill_rate":
		query = query.Order("CASE WHEN capacity > 0 THEN registration_count * 1.0 / capacity ELSE 0 END DESC")
	case "lowest_fill_rate":
		query = query.Order("CASE WHEN capacity > 0 THEN registration_count * 1.0 / capacity ELSE 0 END ASC, events.start_time ASC")
	case "newest":
		query = query.Order("events.start_time DESC")
	case "oldest":
		query = query.Order("events.start_time ASC")
	case "most_registered":
		fallthrough
	default:
		query = query.Order("registration_count DESC, events.start_time ASC")
	}

	var rows []rawRow
	if err := query.Find(&rows).Error; err != nil {
		return nil, err
	}

	// ── Map to transport shape ───────────────────────────────────────
	result := make([]dtos.ReportRow, 0, len(rows))
	for _, row := range rows {
		fillRate := 0.0
		availableSeats := row.Capacity

		if row.Capacity > 0 {
			fillRate = float64(row.RegistrationCount) / float64(row.Capacity) * 100
			availableSeats = row.Capacity - int(row.RegistrationCount)
			if availableSeats < 0 {
				availableSeats = 0 // business rule: clamp to 0 if overbooked unless explicitly requested
			}
		}

		result = append(result, dtos.ReportRow{
			ID:                row.ID,
			Title:             row.Title,
			Type:              row.Type,
			Location:          row.Location,
			Capacity:          row.Capacity,
			RegistrationCount: row.RegistrationCount,
			AvailableSeats:    availableSeats,
			FillRate:          fillRate,
			StartTime:         row.StartTime.Format(time.RFC3339),
			EndTime:           row.EndTime.Format(time.RFC3339),
			Status:            row.Status,
		})
	}

	return result, nil
}

// GetRegistrationTrendsData returns monthly aggregated data.
func (r *ReportRepo) GetRegistrationTrendsData(q dtos.ReportQueryDTO) ([]dtos.TrendReportRow, error) {
	type rawTrend struct {
		Period            string `gorm:"column:period"`
		EventCount        int    `gorm:"column:event_count"`
		RegistrationCount int    `gorm:"column:registration_count"`
	}

	query := r.DB.
		Model(&models.EventRegistration{}).
		Select("TO_CHAR(DATE_TRUNC('month', event_registrations.created_at), 'Mon YYYY') AS period, COUNT(DISTINCT event_registrations.event_id) AS event_count, COUNT(*) AS registration_count").
		Joins("JOIN events ON events.id = event_registrations.event_id").
		Where("event_registrations.status = ?", "approved").
		Group("DATE_TRUNC('month', event_registrations.created_at)").
		Order("DATE_TRUNC('month', event_registrations.created_at) ASC")

	// Apply identical filters to the joined event so trends respect the category/date filters
	if q.Category != "" {
		query = query.Where("UPPER(events.type) = UPPER(?)", q.Category)
	}

	if q.Year > 0 && q.Month > 0 {
		query = query.
			Where("EXTRACT(MONTH FROM events.start_time) = ?", q.Month).
			Where("EXTRACT(YEAR  FROM events.start_time) = ?", q.Year)
	} else if q.Year > 0 {
		query = query.Where("EXTRACT(YEAR FROM events.start_time) = ?", q.Year)
	} else if q.Month > 0 {
		query = query.Where("EXTRACT(MONTH FROM events.start_time) = ?", q.Month)
	}

	const dateFmt = "2006-01-02"
	if q.StartDate != "" {
		start, err := time.Parse(dateFmt, q.StartDate)
		if err == nil {
			query = query.Where("events.start_time >= ?", start)
		}
	}
	if q.EndDate != "" {
		end, err := time.Parse(dateFmt, q.EndDate)
		if err == nil {
			endOfDay := end.Add(24*time.Hour - time.Nanosecond)
			query = query.Where("events.start_time <= ?", endOfDay)
		}
	}

	var rows []rawTrend
	if err := query.Find(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]dtos.TrendReportRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, dtos.TrendReportRow{
			Period:            row.Period,
			EventCount:        row.EventCount,
			RegistrationCount: row.RegistrationCount,
		})
	}

	return result, nil
}

// GetAttendeeReportData returns attendee-centric rows (one row per registration).
// Applies the same month/year/date-range/category filters on the joined event.
func (r *ReportRepo) GetAttendeeReportData(q dtos.ReportQueryDTO) ([]dtos.AttendeeReportRow, error) {
	type rawAttendee struct {
		models.EventRegistration
	}

	query := r.DB.Model(&models.EventRegistration{}).
		Preload("Event").
		Joins("JOIN events ON events.id = event_registrations.event_id")

	if q.EventID > 0 {
		query = query.Where("event_registrations.event_id = ?", q.EventID)
	}

	// category filter
	if q.Category != "" {
		query = query.Where("UPPER(events.type) = UPPER(?)", q.Category)
	}

	// month + year
	if q.Year > 0 && q.Month > 0 {
		query = query.
			Where("EXTRACT(MONTH FROM events.start_time) = ?", q.Month).
			Where("EXTRACT(YEAR  FROM events.start_time) = ?", q.Year)
	} else if q.Year > 0 {
		query = query.Where("EXTRACT(YEAR FROM events.start_time) = ?", q.Year)
	} else if q.Month > 0 {
		query = query.Where("EXTRACT(MONTH FROM events.start_time) = ?", q.Month)
	}

	const dateFmt = "2006-01-02"
	if q.StartDate != "" {
		start, err := time.Parse(dateFmt, q.StartDate)
		if err == nil {
			query = query.Where("events.start_time >= ?", start)
		}
	}
	if q.EndDate != "" {
		end, err := time.Parse(dateFmt, q.EndDate)
		if err == nil {
			endOfDay := end.Add(24*time.Hour - time.Nanosecond)
			query = query.Where("events.start_time <= ?", endOfDay)
		}
	}

	query = query.Order("event_registrations.created_at DESC")

	var rows []rawAttendee
	if err := query.Find(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]dtos.AttendeeReportRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, dtos.AttendeeReportRow{
			RegistrationID: row.ID,
			GuestName:      row.GuestName,
			GuestEmail:     row.GuestEmail,
			GuestPhone:     row.GuestPhone,
			RegStatus:      row.Status,
			EventID:        row.EventID,
			EventTitle:     row.Event.Title,
			EventType:      row.Event.Type,
			EventLocation:  row.Event.Location,
			EventStartTime: row.Event.StartTime.Format(time.RFC3339),
			EventStatus:    row.Event.Status,
		})
	}

	return result, nil
}
