package services

import (
	"errors"
	"net/http"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
)

type RegisterService struct {
	Repo *repository.RegistersRepo
}

func NewRegisterService(repo *repository.RegistersRepo) *RegisterService {
	return &RegisterService{
		Repo: repo,
	}
}

// register logged-in user to event
func (svc *RegisterService) RegisterToEvent(eventID uint, userID uint) (int, error) {

	// check event
	event, err := svc.Repo.GetEventByID(eventID)
	if err != nil {
		return http.StatusNotFound, errors.New("event not found")
	}

	// approved check
	if event.Status != "approved" {
		return http.StatusBadRequest, errors.New("event not approved")
	}

	// check user exists
	_, err = svc.Repo.GetUserByID(userID)
	if err != nil {
		return http.StatusNotFound, errors.New("user not found")
	}

	// duplicate check
	exists, err := svc.Repo.IsAlreadyRegistered(eventID, userID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if exists {
		return http.StatusConflict, errors.New("already registered")
	}

	// capacity check
	count, err := svc.Repo.CountRegistrations(eventID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if int(count) >= event.Capacity {
		return http.StatusBadRequest, errors.New("event is full")
	}

	// create registration
	register := models.EventRegistration{
		EventID: eventID,
		UserID:  userID,
		Status:  "registered",
	}

	err = svc.Repo.CreateRegistration(register)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusCreated, nil
}

// get users inside event
func (svc *RegisterService) GetEventUsers(eventID uint) (int, []models.User, error) {

	data, err := svc.Repo.GetEventUsers(eventID)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, data, nil
}

// get events joined by user
func (svc *RegisterService) GetUserEvents(userID uint) (int, []models.Event, error) {

	data, err := svc.Repo.GetUserEvents(userID)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, data, nil
}

func (svc *RegisterService) CancelRegistration(
	eventID uint,
	userID uint,
) (int, error) {

	// check registration exists
	register, err := svc.Repo.GetRegistration(eventID, userID)
	if err != nil {
		return http.StatusNotFound, errors.New("registration not found")
	}

	// delete registration
	err = svc.Repo.DeleteRegistration(register.ID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
