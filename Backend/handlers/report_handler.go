package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/dtos"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/infra"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/repository"
	"github.com/mubarik/EVENT_MANBAGEMENT_SYSTEM/services"
)

// ReportHandler handles all /admin/reports requests.
type ReportHandler struct {
	Svc *services.ReportService
}

// NewReportHandler wires up the report handler with its dependencies.
func NewReportHandler() *ReportHandler {
	repo := repository.NewReportRepo(infra.DB)
	svc := services.NewReportService(repo)
	return &ReportHandler{Svc: svc}
}

// GetReport handles GET /api/admin/reports
func (h *ReportHandler) GetReport(c *gin.Context) {
	var q dtos.ReportQueryDTO
	if err := c.ShouldBindQuery(&q); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Default type to "performance" if not specified
	if q.Type == "" {
		q.Type = "performance"
	}

	httpStatus, data, ctx, err := h.Svc.GetReport(q)
	if err != nil {
		c.JSON(httpStatus, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "report generated successfully",
		"data":           data,
		"filter_context": ctx,
	})
}
