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

	return &RegisterHandler{
		Service: svc,
	}
}

// POST /api/register
func (h *RegisterHandler) RegisterToEvent(c *gin.Context) {

	var body dtos.RegisterEventDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// from jwt middleware
	userID := c.GetUint("user_id")

	status, err := h.Service.RegisterToEvent(body.EventID, userID)
	if err != nil {
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(status, gin.H{
		"message": "registered successfully",
	})
}

// GET /api/events/:id/users
func (h *RegisterHandler) GetEventUsers(c *gin.Context) {

	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid event id",
		})
		return
	}

	status, data, err := h.Service.GetEventUsers(uint(id))
	if err != nil {
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(status, gin.H{
		"data": data,
	})
}

// GET /api/users/:id/events
func (h *RegisterHandler) GetUserEvents(c *gin.Context) {

	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid user id",
		})
		return
	}

	status, data, err := h.Service.GetUserEvents(uint(id))
	if err != nil {
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(status, gin.H{
		"data": data,
	})
}

func (h *RegisterHandler) CancelRegistration(c *gin.Context) {

	eventIdStr := c.Param("eventId")

	eventID, err := strconv.Atoi(eventIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid event id",
		})
		return
	}

	// logged-in user
	userID := c.GetUint("user_id")

	status, err := h.Service.CancelRegistration(
		uint(eventID),
		userID,
	)

	if err != nil {
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(status, gin.H{
		"message": "registration cancelled successfully",
	})
}
