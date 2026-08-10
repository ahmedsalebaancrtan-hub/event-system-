package dtos

type PublicRegisterDTO struct {
	EventID    uint   `json:"event_id" binding:"required"`
	GuestName  string `json:"guest_name" binding:"required"`
	GuestEmail string `json:"guest_email" binding:"required,email"`
	GuestPhone string `json:"guest_phone"`
}

type ReviewRegistrationDTO struct {
	Status          string `json:"status" binding:"required,oneof=approved rejected"`
	RejectionReason string `json:"rejection_reason"`
}
