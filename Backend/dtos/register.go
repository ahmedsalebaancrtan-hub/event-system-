package dtos

type RegisterEventDTO struct {
	EventID uint `json:"event_id" binding:"required"`
}
