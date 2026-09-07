package services

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/helpers"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/models"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
	"gorm.io/gorm"
)

type RegisterService struct {
	Repo *repository.RegistersRepo
}

func NewRegisterService(repo *repository.RegistersRepo) *RegisterService {
	return &RegisterService{Repo: repo}
}

func (svc *RegisterService) PublicRegister(data *dtos.PublicRegisterDTO) (int, string, error) {

	event, err := svc.Repo.GetEventByID(data.EventID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return http.StatusNotFound, "", errors.New("event not found")
		}
		return http.StatusInternalServerError, "", err
	}

	if event.Status != "approved" {
		return http.StatusBadRequest, "", errors.New("event is not open for registration")
	}

	guestEmail := strings.ToLower(data.GuestEmail)
	existing, err := svc.Repo.GetRegistrationByEmailAndEvent(data.EventID, guestEmail)
	if err == nil {
		if existing.Status == "pending" || existing.Status == "approved" {
			return http.StatusConflict, "", errors.New("you have already registered for this event")
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusInternalServerError, "", err
	}

	count, err := svc.Repo.CountActiveRegistrations(data.EventID)
	if err != nil {
		return http.StatusInternalServerError, "", err
	}

	if int(count) >= event.Capacity {
		return http.StatusBadRequest, "", errors.New("event is full")
	}

	registrationStatus := "pending"
	if event.AutoApprove {
		registrationStatus = "approved"
	}

	registration := models.EventRegistration{
		EventID:    data.EventID,
		GuestName:  data.GuestName,
		GuestEmail: guestEmail,
		GuestPhone: data.GuestPhone,
		Status:     registrationStatus,
		Event:      event,
	}

	if err := svc.Repo.CreateRegistration(registration); err != nil {
		return http.StatusInternalServerError, "", err
	}

	if registration.Status == "approved" {
		go func() {
			log.Printf("[EMAIL] sending auto-approval registration email to %s", registration.GuestEmail)
			if err := svc.sendReviewEmail(registration, "approved"); err != nil {
				log.Printf("[EMAIL ERROR] %v", err)
				return
			}
			log.Printf("[EMAIL] sent auto-approval registration email to %s", registration.GuestEmail)
		}()
	}

	return http.StatusCreated, registration.Status, nil
}

func (svc *RegisterService) ReviewRegistration(regID uint, data *dtos.ReviewRegistrationDTO) (int, error) {
	registration, err := svc.Repo.GetRegistrationByID(regID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return http.StatusNotFound, errors.New("registration not found")
		}
		return http.StatusInternalServerError, err
	}

	if registration.Status != "pending" {
		return http.StatusBadRequest, errors.New("registration has already been reviewed")
	}

	if data.Status == "approved" {
		event := registration.Event
		if event.ID == 0 {
			event, err = svc.Repo.GetEventByID(registration.EventID)
			if err != nil {
				return http.StatusInternalServerError, err
			}
		}

		approvedCount, err := svc.Repo.CountApprovedRegistrations(registration.EventID)
		if err != nil {
			return http.StatusInternalServerError, err
		}

		if int(approvedCount) >= event.Capacity {
			return http.StatusBadRequest, errors.New("event is full")
		}
	}

	registration.Status = data.Status
	registration.RejectionReason = data.RejectionReason

	if err := svc.Repo.UpdateRegistration(&registration); err != nil {
		return http.StatusInternalServerError, err
	}

	go func() {
		log.Printf("[EMAIL] sending %s registration email to %s", data.Status, registration.GuestEmail)
		if err := svc.sendReviewEmail(registration, data.Status); err != nil {
			log.Printf("[EMAIL ERROR] %v", err)
			return
		}
		log.Printf("[EMAIL] sent %s registration email to %s", data.Status, registration.GuestEmail)
	}()

	return http.StatusOK, nil
}

func (svc *RegisterService) GetPendingRegistrations() (int, []models.EventRegistration, error) {
	registrations, err := svc.Repo.GetPendingRegistrations()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, registrations, nil
}

func (svc *RegisterService) GetApprovedRegistrations() (int, []models.EventRegistration, error) {
	registrations, err := svc.Repo.GetApprovedRegistrations()
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, registrations, nil
}

func (svc *RegisterService) GetApprovedRegistrationsByEvent(eventID uint) (int, []models.EventRegistration, error) {
	registrations, err := svc.Repo.GetApprovedRegistrationsByEvent(eventID)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, registrations, nil
}

func (svc *RegisterService) GetApprovedEventsByGuestEmail(email string) (int, []models.Event, error) {
	events, err := svc.Repo.GetApprovedEventsByGuestEmail(email)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	return http.StatusOK, events, nil
}

func (svc *RegisterService) sendReviewEmail(registration models.EventRegistration, status string) error {
	event := registration.Event
	subject := "Event Registration Update"
	var body string

	switch status {
	case "approved":
		subject = fmt.Sprintf("Registration Confirmed: %s", event.Title)
		body = fmt.Sprintf(
			`<html><body>
			<h2>Registration Approved</h2>
			<p>Hello %s,</p>
			<p>Your registration for the following event has been <strong>approved</strong>.</p>
			<ul>
				<li><strong>Event:</strong> %s</li>
				<li><strong>Location:</strong> %s</li>
				<li><strong>Start:</strong> %s</li>
				<li><strong>End:</strong> %s</li>
			</ul>
			<p>We look forward to seeing you there!</p>
			</body></html>`,
			registration.GuestName,
			event.Title,
			event.Location,
			event.StartTime.Format("Jan 2, 2006 3:04 PM"),
			event.EndTime.Format("Jan 2, 2006 3:04 PM"),
		)
	case "rejected":
		subject = fmt.Sprintf("Registration Update: %s", event.Title)
		reason := registration.RejectionReason
		if reason == "" {
			reason = "No reason was provided."
		}
		body = fmt.Sprintf(
			`<html><body>
			<h2>Registration Not Approved</h2>
			<p>Hello %s,</p>
			<p>Thank you for your interest in <strong>%s</strong>. Unfortunately, we are unable to approve your registration at this time.</p>
			<p><strong>Reason:</strong> %s</p>
			<p>If you have questions, please contact the event organizers.</p>
			</body></html>`,
			registration.GuestName,
			event.Title,
			reason,
		)
	default:
		return fmt.Errorf("unsupported registration email status %q", status)
	}

	if err := helpers.SendEmail(registration.GuestEmail, subject, body); err != nil {
		return fmt.Errorf("failed to send %s registration email to %s: %w", status, registration.GuestEmail, err)
	}

	return nil
}

func (svc *RegisterService) FilterRegistrations(filter *dtos.RegistrationFilterDTO) (int, []models.EventRegistration, int64, error) {
	_, limit, offset := dtos.ResolvePagination(filter.Page, filter.Limit, 10)
	registrations, total, err := svc.Repo.FilterRegistrations(*filter, limit, offset)
	if err != nil {
		return http.StatusInternalServerError, nil, 0, err
	}

	return http.StatusOK, registrations, total, nil
}
