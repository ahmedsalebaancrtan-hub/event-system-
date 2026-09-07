package repository

import (
	"time"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/gorm"
)

type EventRepo struct {
	DB *gorm.DB
}

func RegisterEventRepo(db *gorm.DB) *EventRepo {
	return &EventRepo{
		DB: db,
	}

}

func (r *EventRepo) CreateEvent(event models.Event) error {
	return r.DB.Create(&event).Error
}

func (r *EventRepo) GetallEvents(limit, offset int) ([]models.Event, int64, error) {
	var events []models.Event
	var total int64

	// Get total count first
	err := r.DB.Model(&models.Event{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated data
	err = r.DB.Limit(limit).Offset(offset).Find(&events).Error
	if err != nil {
		return nil, 0, err
	}

	return events, total, nil

}

func (r *EventRepo) GetEventByID(id uint) (models.Event, error) {
	var event models.Event
	err := r.DB.First(&event, id).Error
	return event, err

}

func (r *EventRepo) UpdateEventStatus(id uint, status string, adminID uint) error {
	return r.DB.Model(&models.Event{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":      status,
			"reviewed_by": adminID,
			"reviewed_at": gorm.Expr("NOW()"),
		}).Error
}
func (r *EventRepo) GetApprovedEvents() ([]models.Event, error) {
	var events []models.Event
	err := r.DB.Where("status = ?", "approved").Find(&events).Error
	return events, err
}

func (r *EventRepo) UpdateEvent(event models.Event) error {
	return r.DB.Save(&event).Error
}

func (r *EventRepo) FilterEvents(
	filter dtos.EventFilterDTO,
	startDate *time.Time,
	endDate *time.Time,
	limit int,
	offset int,
) ([]models.Event, int64, error) {

	var events []models.Event
	var total int64
	query := r.DB.Model(&models.Event{})

	if filter.Location != "" {
		query = query.Where("LOWER(location) = LOWER(?)", filter.Location)
	}

	if filter.Type != "" {
		query = query.Where("LOWER(type) = LOWER(?)", filter.Type)
	}

	if filter.Search != "" {
		query = query.Where("LOWER(title) LIKE LOWER(?)", "%"+filter.Search+"%")
	}

	if filter.Status != "" {
		query = query.Where("LOWER(status) = LOWER(?)", filter.Status)
	}

	// 🔥 Correct overlap logic
	if startDate != nil && endDate != nil {
		query = query.Where("start_time <= ? AND end_time >= ?", *endDate, *startDate)
	} else if startDate != nil {
		query = query.Where("end_time >= ?", *startDate)
	} else if endDate != nil {
		query = query.Where("start_time <= ?", *endDate)
	}

	// Count total records for this query
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Paginate the query
	err := query.Limit(limit).Offset(offset).Find(&events).Error
	return events, total, err
}
