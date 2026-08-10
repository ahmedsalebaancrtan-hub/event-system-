package models

import "time"

type EventRegistration struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	EventID         uint      `json:"event_id" gorm:"not null"`
	GuestName       string    `json:"guest_name" gorm:"size:100;not null"`
	GuestEmail      string    `json:"guest_email" gorm:"size:100;not null"`
	GuestPhone      string    `json:"guest_phone" gorm:"size:20"`
	Status          string    `json:"status" gorm:"default:'pending'"`
	RejectionReason string    `json:"rejection_reason" gorm:"type:text"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Event           Event     `json:"event" gorm:"foreignKey:EventID"`
}
