package repository

import (
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/gorm"
)

type RegistersRepo struct {
	DB *gorm.DB
}

func NewRegisterRepo(db *gorm.DB) *RegistersRepo {
	return &RegistersRepo{DB: db}
}

func (r *RegistersRepo) GetEventByID(id uint) (models.Event, error) {
	var event models.Event
	err := r.DB.First(&event, id).Error
	return event, err
}

func (r *RegistersRepo) CreateRegistration(data models.EventRegistration) error {
	return r.DB.Create(&data).Error
}

func (r *RegistersRepo) CountActiveRegistrations(eventID uint) (int64, error) {
	var count int64
	err := r.DB.Model(&models.EventRegistration{}).
		Where("event_id = ? AND status IN ?", eventID, []string{"pending", "approved"}).
		Count(&count).Error
	return count, err
}

func (r *RegistersRepo) CountApprovedRegistrations(eventID uint) (int64, error) {
	var count int64
	err := r.DB.Model(&models.EventRegistration{}).
		Where("event_id = ? AND status = ?", eventID, "approved").
		Count(&count).Error
	return count, err
}

func (r *RegistersRepo) GetRegistrationByID(id uint) (models.EventRegistration, error) {
	var registration models.EventRegistration
	err := r.DB.Preload("Event").First(&registration, id).Error
	return registration, err
}

func (r *RegistersRepo) UpdateRegistration(registration *models.EventRegistration) error {
	return r.DB.Save(registration).Error
}

func (r *RegistersRepo) GetPendingRegistrations() ([]models.EventRegistration, error) {
	var registrations []models.EventRegistration
	err := r.DB.Preload("Event").Where("status = ?", "pending").Find(&registrations).Error
	return registrations, err
}

func (r *RegistersRepo) GetApprovedRegistrations() ([]models.EventRegistration, error) {
	var registrations []models.EventRegistration
	err := r.DB.Preload("Event").Where("status = ?", "approved").Find(&registrations).Error
	return registrations, err
}

func (r *RegistersRepo) GetApprovedRegistrationsByEvent(eventID uint) ([]models.EventRegistration, error) {
	var registrations []models.EventRegistration
	err := r.DB.
		Preload("Event").
		Where("event_id = ? AND status = ?", eventID, "approved").
		Find(&registrations).Error
	return registrations, err
}

func (r *RegistersRepo) GetApprovedEventsByGuestEmail(email string) ([]models.Event, error) {
	var events []models.Event
	err := r.DB.
		Model(&models.Event{}).
		Joins("JOIN event_registrations ON event_registrations.event_id = events.id").
		Where("event_registrations.guest_email = ? AND event_registrations.status = ?", email, "approved").
		Find(&events).Error
	return events, err
}

func (r *RegistersRepo) GetRegistrationByEmailAndEvent(eventID uint, email string) (models.EventRegistration, error) {
	var registration models.EventRegistration
	err := r.DB.
		Where("event_id = ? AND guest_email = ?", eventID, email).
		First(&registration).Error
	return registration, err
}

func (r *RegistersRepo) FilterRegistrations(filter dtos.RegistrationFilterDTO, limit, offset int) ([]models.EventRegistration, int64, error) {
	var registrations []models.EventRegistration
	var total int64
	query := r.DB.Preload("Event").Model(&models.EventRegistration{})

	if filter.Status != "" {
		query = query.Where("LOWER(status) = LOWER(?)", filter.Status)
	}
	if filter.EventID != "" && filter.EventID != "all" {
		query = query.Where("event_id = ?", filter.EventID)
	}
	if filter.Search != "" {
		query = query.Where("LOWER(guest_name) LIKE LOWER(?) OR LOWER(guest_email) LIKE LOWER(?)", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Limit(limit).Offset(offset).Find(&registrations).Error
	return registrations, total, err
}
