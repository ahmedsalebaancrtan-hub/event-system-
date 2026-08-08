package repository

import (
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"gorm.io/gorm"
)

type RegistersRepo struct {
	DB *gorm.DB
}

func NewRegisterRepo(db *gorm.DB) *RegistersRepo {
	return &RegistersRepo{
		DB: db,
	}
}

// get event
func (r *RegistersRepo) GetEventByID(id uint) (models.Event, error) {

	var event models.Event

	err := r.DB.First(&event, id).Error

	return event, err
}

// get user
func (r *RegistersRepo) GetUserByID(id uint) (models.User, error) {

	var user models.User

	err := r.DB.First(&user, id).Error

	return user, err
}

// check duplicate registration
func (r *RegistersRepo) IsAlreadyRegistered(eventID uint, userID uint) (bool, error) {

	var count int64

	err := r.DB.Model(&models.EventRegistration{}).
		Where("event_id = ? AND user_id = ?", eventID, userID).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// count registrations
func (r *RegistersRepo) CountRegistrations(eventID uint) (int64, error) {

	var count int64

	err := r.DB.Model(&models.EventRegistration{}).
		Where("event_id = ?", eventID).
		Count(&count).Error

	return count, err
}

// create registration
func (r *RegistersRepo) CreateRegistration(data models.EventRegistration) error {

	return r.DB.Create(&data).Error
}

// get users inside event
func (r *RegistersRepo) GetEventUsers(eventID uint) ([]models.User, error) {

	var users []models.User

	err := r.DB.
		Table("users").
		Joins("JOIN event_registrations ON users.id = event_registrations.user_id").
		Where("event_registrations.event_id = ?", eventID).
		Find(&users).Error

	return users, err
}

// get events joined by user
func (r *RegistersRepo) GetUserEvents(userID uint) ([]models.Event, error) {
	var events []models.Event

	// Using .Model() instead of .Table() allows GORM to safely scan the results
	err := r.DB.Debug().Model(&models.Event{}).
		Joins("JOIN event_registrations ON event_registrations.event_id = events.id").
		Where("event_registrations.user_id = ?", userID).
		Find(&events).Error

	return events, err
}

func (r *RegistersRepo) GetRegistration(
	eventID uint,
	userID uint,
) (models.EventRegistration, error) {

	var register models.EventRegistration

	err := r.DB.
		Where("event_id = ? AND user_id = ?", eventID, userID).
		First(&register).Error

	return register, err
}

// delete registration
func (r *RegistersRepo) DeleteRegistration(id uint) error {

	return r.DB.Delete(&models.EventRegistration{}, id).Error
}
