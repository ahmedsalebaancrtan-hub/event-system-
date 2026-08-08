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

type EventHandler struct {
	EventSvc *services.EventSvc
}

func RegisterEventHandler() *EventHandler {

	eventRepo := repository.RegisterEventRepo(infra.DB)
	EventSvc := services.RegistersvcRepo(eventRepo)

	return &EventHandler{
		EventSvc: EventSvc,
	}
}

func (h *EventHandler) CreateEvent(c *gin.Context) {
	var body dtos.CreateEventDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status, err := h.EventSvc.CreateEvent(&body)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{"message": "event submitted for approval"})
}
func (h *EventHandler) ApproveEvent(c *gin.Context) {

	idStr := c.Param("id")
	eventID, _ := strconv.Atoi(idStr)

	var body dtos.ApproveEventDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// assume admin ID comes from middleware
	adminID := c.GetUint("user_id")

	status, err := h.EventSvc.ApproveEvent(uint(eventID), adminID, body.Status)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{"message": "event status updated"})
}
func (h *EventHandler) GetApprovedEvents(c *gin.Context) {

	status, data, err := h.EventSvc.GetApprovedEvents()
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"message": "approved events fetched",
		"data":    data,
	})
}
func (h *EventHandler) Getall(c *gin.Context) {
	status, event, err := h.EventSvc.Getall()

	if err != nil {
		c.JSON(status, gin.H{
			"is_success": false,
			"messege":    err.Error(),
		})
		return
	}

	c.JSON(status, gin.H{
		"is_sucess": true,
		"messege":   "events fecthed sucessfully!",
		"data":      event,
	})

}

func (h *EventHandler) FindEventByid(c *gin.Context) {
	IdStr := c.Param("event_id")

	id, err := strconv.Atoi(IdStr)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"messege":    "failed to get  Event_id param",
			"is_success": false,
			"error":      err.Error(),
		})
		return
	}

	status, event, err := h.EventSvc.GetEventById(uint(id))

	if err != nil {
		c.JSON(status, gin.H{
			"is_success": false,
			"messege":    err.Error(),
		})
		return
	}

	c.JSON(status, gin.H{
		"is_sucess": true,
		"messege":   "event fecthed sucessfully!",
		"data":      event,
	})

}

func (h *EventHandler) UpdateEvent(c *gin.Context) {

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var body dtos.UpdateEventDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status, err := h.EventSvc.UpdateEvent(uint(id), &body)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"message": "event updated successfully",
	})
}

func (h *EventHandler) FilterEvents(c *gin.Context) {

	var filter dtos.EventFilterDTO

	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status, data, err := h.EventSvc.FilterEvents(&filter)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(status, gin.H{
		"data": data,
	})
}
