package services

import (
	"net/http"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
)

// ReportService orchestrates report data retrieval.
type ReportService struct {
	Repo *repository.ReportRepo
}

func NewReportService(repo *repository.ReportRepo) *ReportService {
	return &ReportService{Repo: repo}
}

// GetReport dispatches to the correct report query based on the `type` param.
func (svc *ReportService) GetReport(q dtos.ReportQueryDTO) (
	int,
	interface{},
	dtos.ReportFilterContext,
	error,
) {
	ctx := dtos.ReportFilterContext{
		Type:      q.Type,
		SortBy:    q.SortBy,
		EventID:   q.EventID,
		Year:      q.Year,
		Month:     q.Month,
		StartDate: q.StartDate,
		EndDate:   q.EndDate,
		Category:  q.Category,
	}

	if q.Type == "details" {
		// Attendee roster — returns registration-level rows
		rows, err := svc.Repo.GetAttendeeReportData(q)
		if err != nil {
			return http.StatusInternalServerError, nil, ctx, err
		}

		ctx.Total = len(rows)

		// Calculate context stats based on attendee details if needed
		if len(rows) > 0 {
			ctx.TotalRegistrations = len(rows)
		}

		return http.StatusOK, rows, ctx, nil
	}

	if q.Type == "trends" {
		// Monthly registration trends
		rows, err := svc.Repo.GetRegistrationTrendsData(q)
		if err != nil {
			return http.StatusInternalServerError, nil, ctx, err
		}

		ctx.Total = len(rows)

		// Calculate stats for trends
		totalReg := 0
		totalEvt := 0
		mostPopPeriod := ""
		maxReg := -1

		for _, row := range rows {
			totalReg += row.RegistrationCount
			totalEvt += row.EventCount
			if row.RegistrationCount > maxReg {
				maxReg = row.RegistrationCount
				mostPopPeriod = row.Period
			}
		}

		ctx.TotalRegistrations = totalReg
		ctx.TotalEvents = totalEvt
		if totalEvt > 0 {
			ctx.AvgRegPerEvent = float64(totalReg) / float64(totalEvt)
		}
		if mostPopPeriod != "" {
			ctx.MostPopularEvent = mostPopPeriod // reusing field for period
		}

		return http.StatusOK, rows, ctx, nil
	}

	// Default to "performance" (event-level rows)
	rows, err := svc.Repo.GetEventReportData(q)
	if err != nil {
		return http.StatusInternalServerError, nil, ctx, err
	}

	ctx.Total = len(rows)

	// Calculate contextual stats for Performance Report
	totalEvts := len(rows)
	totalRegs := 0
	totalFillRate := 0.0
	eventsWithCapacity := 0
	nearCapacity := 0

	for _, row := range rows {
		totalRegs += int(row.RegistrationCount)
		if row.Capacity > 0 {
			eventsWithCapacity++
			totalFillRate += row.FillRate
			if row.FillRate >= 90.0 {
				nearCapacity++
			}
		}
	}

	ctx.TotalEvents = totalEvts
	ctx.TotalRegistrations = totalRegs
	ctx.EventsNearCapacity = nearCapacity
	if eventsWithCapacity > 0 {
		ctx.AverageFillRate = totalFillRate / float64(eventsWithCapacity)
	}

	return http.StatusOK, rows, ctx, nil
}
