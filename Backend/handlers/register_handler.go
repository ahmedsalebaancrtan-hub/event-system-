package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/services"
)

type RegisterHandler struct {
	Service *services.RegisterService
}

func NewRegisterHandler() *RegisterHandler {
	repo := repository.NewRegisterRepo(infra.DB)
	svc := services.NewRegisterService(repo)

	return &RegisterHandler{Service: svc}
}

func (h *RegisterHandler) PublicRegister(c *gin.Context) {
	var body dtos.PublicRegisterDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	httpStatus, registrationStatus, err := h.Service.PublicRegister(&body)
	if err != nil {
		c.JSON(httpStatus, gin.H{"error": err.Error()})
		return
	}

	message := "registration submitted successfully and is pending review"
	if registrationStatus == "approved" {
		message = "registration approved successfully"
	}

	c.JSON(httpStatus, gin.H{
		"message": message,
		"status":  registrationStatus,
	})
}

func (h *RegisterHandler) ReviewRegistration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid registration id"})
		return
	}

	var body dtos.ReviewRegistrationDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status, err := h.Service.ReviewRegistration(uint(id), &body)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"message": "registration reviewed successfully",
	})
}

func (h *RegisterHandler) GetPendingRegistrations(c *gin.Context) {
	status, data, err := h.Service.GetPendingRegistrations()
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"message": "pending registrations fetched",
		"data":    data,
	})
}

func (h *RegisterHandler) GetApprovedRegistrations(c *gin.Context) {
	status, data, err := h.Service.GetApprovedRegistrations()
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"message": "approved registrations fetched",
		"data":    data,
	})
}

func (h *RegisterHandler) GetApprovedEventAttendees(c *gin.Context) {
	eventID, err := strconv.ParseUint(c.Param("event_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	status, data, err := h.Service.GetApprovedRegistrationsByEvent(uint(eventID))
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	attendees := make([]gin.H, 0, len(data))
	for _, registration := range data {
		attendees = append(attendees, gin.H{
			"id":     registration.ID,
			"name":   registration.GuestName,
			"email":  registration.GuestEmail,
			"phone":  registration.GuestPhone,
			"role":   "GUEST",
			"status": registration.Status,
		})
	}

	c.JSON(status, gin.H{
		"message": "approved event attendees fetched",
		"data":    attendees,
	})
}

func (h *RegisterHandler) GetApprovedEventsForCurrentGuest(c *gin.Context) {
	emailValue, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authenticated email not found"})
		return
	}

	email, ok := emailValue.(string)
	if !ok || email == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authenticated email not found"})
		return
	}

	status, data, err := h.Service.GetApprovedEventsByGuestEmail(email)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"message": "approved registered events fetched",
		"data":    data,
	})
}
