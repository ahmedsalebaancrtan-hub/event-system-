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
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	httpStatus, registrationStatus, err := h.Service.PublicRegister(&body)
	if err != nil {
		c.JSON(httpStatus, gin.H{"success": false, "message": err.Error()})
		return
	}

	message := "registration submitted successfully and is pending review"
	if registrationStatus == "approved" {
		message = "registration approved successfully"
	}

	c.JSON(httpStatus, gin.H{
		"success": true,
		"message": message,
		"status":  registrationStatus,
	})
}

func (h *RegisterHandler) ReviewRegistration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid registration id"})
		return
	}

	var body dtos.ReviewRegistrationDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	status, err := h.Service.ReviewRegistration(uint(id), &body)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"success": true,
		"message": "registration reviewed successfully",
	})
}

func (h *RegisterHandler) GetPendingRegistrations(c *gin.Context) {
	status, data, err := h.Service.GetPendingRegistrations()
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"success": true,
		"message": "pending registrations fetched",
		"data":    data,
	})
}

func (h *RegisterHandler) GetApprovedRegistrations(c *gin.Context) {
	status, data, err := h.Service.GetApprovedRegistrations()
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"success": true,
		"message": "approved registrations fetched",
		"data":    data,
	})
}

func (h *RegisterHandler) GetApprovedEventAttendees(c *gin.Context) {
	eventID, err := strconv.ParseUint(c.Param("event_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid event id"})
		return
	}

	status, data, err := h.Service.GetApprovedRegistrationsByEvent(uint(eventID))
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
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
		"success": true,
		"message": "approved event attendees fetched",
		"data":    attendees,
	})
}

func (h *RegisterHandler) GetApprovedEventsForCurrentGuest(c *gin.Context) {
	emailValue, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "authenticated email not found"})
		return
	}

	email, ok := emailValue.(string)
	if !ok || email == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "authenticated email not found"})
		return
	}

	status, data, err := h.Service.GetApprovedEventsByGuestEmail(email)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"success": true,
		"message": "approved registered events fetched",
		"data":    data,
	})
}

func (h *RegisterHandler) FilterRegistrations(c *gin.Context) {
	var filter dtos.RegistrationFilterDTO

	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	status, data, total, err := h.Service.FilterRegistrations(&filter)
	if err != nil {
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	page, limit, _ := dtos.ResolvePagination(filter.Page, filter.Limit, 10)
	meta := dtos.BuildMeta(page, limit, total)

	c.JSON(status, gin.H{
		"success":    true,
		"message":    "registrations filtered successfully",
		"data":       data,
		"pagination": meta,
	})
}
