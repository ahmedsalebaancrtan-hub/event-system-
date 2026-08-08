package services

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
)

type EventSvc struct {
	Repo *repository.EventRepo
}

func RegistersvcRepo(Repo *repository.EventRepo) *EventSvc {
	return &EventSvc{
		Repo: Repo,
	}
}

func (svc *EventSvc) CreateEvent(data *dtos.CreateEventDTO) (int, error) {

	layout := time.RFC3339

	start, err := time.Parse(layout, data.StartTime)
	if err != nil {
		return http.StatusBadRequest, errors.New("invalid start_time")
	}

	end, err := time.Parse(layout, data.EndTime)
	if err != nil {
		return http.StatusBadRequest, errors.New("invalid end_time")
	}

	if end.Before(start) {
		return http.StatusBadRequest, errors.New("end_time cannot be before start_time")
	}
	eventType := models.EventType(data.Type)

	event := models.Event{
		Title:       data.Title,
		Type:        string(eventType),
		Location:    data.Location,
		StartTime:   start,
		EndTime:     end,
		Capacity:    data.Capacity,
		Description: data.Description,
		ImgUrl:      data.ImgUrl,
		Status:      "pending", // 🔥 important
	}

	if err := svc.Repo.CreateEvent(event); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusCreated, nil
}
func (svc *EventSvc) GetApprovedEvents() (int, []models.Event, error) {

	events, err := svc.Repo.GetApprovedEvents()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, events, nil
}

func (svc *EventSvc) ApproveEvent(eventID uint, adminID uint, status string) (int, error) {

	if status != "approved" && status != "rejected" {
		return http.StatusBadRequest, errors.New("invalid status")
	}

	_, err := svc.Repo.GetEventByID(eventID)
	if err != nil {
		return http.StatusNotFound, errors.New("event not found")
	}

	if err := svc.Repo.UpdateEventStatus(eventID, status, adminID); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (svc *EventSvc) Getall() (int, []models.Event, error) {

	events, err := svc.Repo.GetallEvents()

	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, events, nil
}

func (svc *EventSvc) GetEventById(id uint) (int, models.Event, error) {

	data, err := svc.Repo.GetEventByID(id)

	if err != nil {
		return http.StatusInternalServerError, models.Event{}, err
	}

	return http.StatusOK, data, nil
}


func (svc *EventSvc) UpdateEvent(id uint, data *dtos.UpdateEventDTO) (int, error) {

	event, err := svc.Repo.GetEventByID(id)
	if err != nil {
		return http.StatusNotFound, errors.New("event not found")
	}

	layout := time.RFC3339

	// Update fields only if provided

	if data.Title != nil {
		event.Title = *data.Title
	}

	if data.Type != nil {
		event.Type = *data.Type
	}

	if data.Location != nil {
		event.Location = *data.Location
	}

	if data.Description != nil {
		event.Description = *data.Description
	}

	if data.ImgURL != nil {
		imgUrl := strings.TrimSpace(*data.ImgURL)
		lowerImgUrl := strings.ToLower(imgUrl)
		if imgUrl != "" && !strings.HasPrefix(lowerImgUrl, "http") && !strings.HasPrefix(lowerImgUrl, "data:image/") {
			return http.StatusBadRequest, errors.New("invalid image url")
		}
		event.ImgUrl = imgUrl
	}

	// Handle time updates carefully
	var start = event.StartTime
	var end = event.EndTime

	if data.StartTime != nil {
		parsedStart, err := time.Parse(layout, *data.StartTime)
		if err != nil {
			return http.StatusBadRequest, errors.New("invalid start_time format")
		}
		start = parsedStart
	}

	if data.EndTime != nil {
		parsedEnd, err := time.Parse(layout, *data.EndTime)
		if err != nil {
			return http.StatusBadRequest, errors.New("invalid end_time format")
		}
		end = parsedEnd
	}

	// Validate after updates
	if end.Before(start) {
		return http.StatusBadRequest, errors.New("end_time cannot be before start_time")
	}

	event.StartTime = start
	event.EndTime = end

	if data.Capacity != nil {
		if *data.Capacity <= 0 {
			return http.StatusBadRequest, errors.New("capacity must be greater than 0")
		}
		event.Capacity = *data.Capacity
	}

	if err := svc.Repo.UpdateEvent(event); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
func (svc *EventSvc) FilterEvents(filter *dtos.EventFilterDTO) (int, []models.Event, error) {

	layout := "2006-01-02"

	var startDate *time.Time
	var endDate *time.Time

	// Parse start_date
	if filter.StartDate != "" {
		parsedStart, err := time.Parse(layout, filter.StartDate)
		if err != nil {
			return http.StatusBadRequest, nil, errors.New("invalid start_date format (YYYY-MM-DD)")
		}
		startDate = &parsedStart
	}

	// Parse end_date
	if filter.EndDate != "" {
		parsedEnd, err := time.Parse(layout, filter.EndDate)
		if err != nil {
			return http.StatusBadRequest, nil, errors.New("invalid end_date format (YYYY-MM-DD)")
		}

		// extend to end of day
		endOfDay := parsedEnd.Add(24*time.Hour - time.Nanosecond)
		endDate = &endOfDay
	}

	// 🔴 important validation
	if startDate != nil && endDate != nil && endDate.Before(*startDate) {
		return http.StatusBadRequest, nil, errors.New("end_date cannot be before start_date")
	}

	// call repo with parsed values
	data, err := svc.Repo.FilterEvents(*filter, startDate, endDate)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, data, nil
}
