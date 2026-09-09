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
	return &EventHandler{EventSvc: EventSvc}
}

func (h *EventHandler) CreateEvent(c *gin.Context) {
	var body dtos.CreateEventDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}
	status, err := h.EventSvc.CreateEvent(&body)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "event submitted for approval", nil)
}

func (h *EventHandler) ApproveEvent(c *gin.Context) {
	idStr := c.Param("id")
	eventID, err := strconv.Atoi(idStr)
	if err != nil {
		fail(c, http.StatusBadRequest, "invalid event id")
		return
	}

	var body dtos.ApproveEventDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}

	adminID := c.GetUint("user_id")
	status, err := h.EventSvc.ApproveEvent(uint(eventID), adminID, body.Status)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "event status updated", nil)
}

func (h *EventHandler) GetApprovedEvents(c *gin.Context) {
	status, data, err := h.EventSvc.GetApprovedEvents()
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "approved events fetched successfully", data)
}

func (h *EventHandler) Getall(c *gin.Context) {
	var p dtos.PaginationDTO
	_ = c.ShouldBindQuery(&p)

	status, events, total, err := h.EventSvc.Getall(p.Page, p.Limit)
	if err != nil {
		fail(c, status, err.Error())
		return
	}

	page, limit, _ := dtos.ResolvePagination(p.Page, p.Limit, 8)
	meta := dtos.BuildMeta(page, limit, total)
	okPaginated(c, status, "events fetched successfully!", events, meta)
}

func (h *EventHandler) FindEventByid(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("event_id"))
	if err != nil {
		fail(c, http.StatusBadRequest, "invalid event_id param")
		return
	}

	status, event, err := h.EventSvc.GetEventById(uint(id))
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "event fetched successfully!", event)
}

func (h *EventHandler) UpdateEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		fail(c, http.StatusBadRequest, "invalid id")
		return
	}

	var body dtos.UpdateEventDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}

	status, err := h.EventSvc.UpdateEvent(uint(id), &body)
	if err != nil {
		fail(c, status, err.Error())
		return
	}
	ok(c, status, "event updated successfully", nil)
}

func (h *EventHandler) FilterEvents(c *gin.Context) {
	var filter dtos.EventFilterDTO
	if err := c.ShouldBindQuery(&filter); err != nil {
		fail(c, http.StatusBadRequest, err.Error())
		return
	}

	status, data, total, err := h.EventSvc.FilterEvents(&filter)
	if err != nil {
		fail(c, status, err.Error())
		return
	}

	page, limit, _ := dtos.ResolvePagination(filter.Page, filter.Limit, 8)
	meta := dtos.BuildMeta(page, limit, total)
	okPaginated(c, status, "events filtered successfully", data, meta)
}
